import { Resume, PersonalInfo, SkillSubsection } from '@/types/resume'
import { resumeVersionApi, personalInfoApi, ApiError } from './api'
import { validateResumeForApi, sanitizeResumeForApi } from './validation'
import { PersonalInfoExtractor } from './personalInfoExtractor'

// Fallback to localStorage for offline mode or when API is unavailable
const STORAGE_KEY = 'resume-editor-data'

// Migration function to convert old string[] skills to SkillSubsection[] format
function migrateSkillsFormat(skills: any): SkillSubsection[] {
    if (!skills || !Array.isArray(skills)) {
        return []
    }

    // If it's already in SkillSubsection format, return as is
    if (skills.length > 0 && typeof skills[0] === 'object' && 'name' in skills[0] && 'skills' in skills[0]) {
        return skills as SkillSubsection[]
    }

    // If it's in old string[] format, convert to SkillSubsection format
    if (skills.length > 0 && typeof skills[0] === 'string') {
        return [{
            name: 'Technical Skills',
            skills: skills.filter(skill => typeof skill === 'string' && skill.trim().length > 0)
        }]
    }

    return []
}

// Migrate resume data to ensure compatibility
function migrateResumeData(resume: any): Resume {
    if (!resume) return resume

    return {
        ...resume,
        skills: migrateSkillsFormat(resume.skills)
    }
}

// Save resume to database (primary) with localStorage fallback
export const saveResumeToDatabase = async (
    resume: Resume,
    companyName: string = 'Default Company',
    jobTitle: string = 'Software Engineer',
    companyEmail?: string,
    jobDescription?: string,
    extractedPersonalInfo?: PersonalInfo | null,
    forceNewResume: boolean = false
): Promise<{ id: string } | null> => {
    console.log('saveResumeToDatabase called with:', { resume, companyName, jobTitle })

    try {
        // Handle personal information extraction and creation
        let personalInfoToSave = extractedPersonalInfo

        // If no personal info provided (undefined), try to extract from resume data
        // If explicitly set to null, skip personal info extraction entirely
        if (extractedPersonalInfo === undefined) {
            // Try AI extraction first, fallback to regex
            try {
                const combinedText = [
                    resume.title || '',
                    resume.summary || '',
                    ...(resume.experience || []).map(exp => `${exp.role} at ${exp.organization}`),
                    ...(resume.education || []).map(edu => `${edu.degree} from ${edu.school}`)
                ].join(' ')

                personalInfoToSave = await PersonalInfoExtractor.extractFromText(combinedText) ||
                    PersonalInfoExtractor.extractFromResumeData(resume)
            } catch (error) {
                console.warn('AI personal info extraction failed, using regex fallback:', error)
                personalInfoToSave = PersonalInfoExtractor.extractFromResumeData(resume)
            }
        }

        // Create or update personal information if we have it
        if (personalInfoToSave) {
            try {
                console.log('Creating/updating personal information...')
                const existingPersonalInfo = await personalInfoApi.get()

                if (existingPersonalInfo) {
                    // Update existing personal info - but don't overwrite name unless explicitly provided
                    // Only update fields that are explicitly provided and not extracted from resume data
                    const updates: any = {}

                    // Only update email if it's provided and not extracted from resume data
                    if (personalInfoToSave.email && extractedPersonalInfo !== undefined) {
                        updates.email = personalInfoToSave.email
                    }

                    // Only update phone if it's provided and not extracted from resume data
                    if (personalInfoToSave.phone && extractedPersonalInfo !== undefined) {
                        updates.phone = personalInfoToSave.phone
                    }

                    // Only update LinkedIn if it's provided and not extracted from resume data
                    if (personalInfoToSave.linkedin && extractedPersonalInfo !== undefined) {
                        updates.linkedin_url = personalInfoToSave.linkedin
                    }

                    // Only update GitHub if it's provided and not extracted from resume data
                    if (personalInfoToSave.github && extractedPersonalInfo !== undefined) {
                        updates.portfolio_url = personalInfoToSave.github
                    }

                    // Only update name if it's explicitly provided (not extracted from resume data)
                    if (personalInfoToSave.name && extractedPersonalInfo !== undefined) {
                        updates.full_name = personalInfoToSave.name
                    }

                    // Only perform update if there are actual changes
                    if (Object.keys(updates).length > 0) {
                        await personalInfoApi.update(updates)
                        console.log('Updated personal information successfully')
                    } else {
                        console.log('No personal information updates needed')
                    }
                } else {
                    // Create new personal info - only if we have explicit personal info, not extracted
                    if (extractedPersonalInfo !== undefined) {
                        await personalInfoApi.create({
                            full_name: personalInfoToSave.name || 'Unknown',
                            email: personalInfoToSave.email || 'unknown@example.com',
                            phone: personalInfoToSave.phone,
                            location: undefined, // Not in PersonalInfo interface
                            linkedin_url: personalInfoToSave.linkedin,
                            portfolio_url: personalInfoToSave.github
                        })
                        console.log('Created personal information successfully')
                    } else {
                        console.log('Skipping personal info creation - extracted data should not create new records')
                    }
                }
            } catch (error) {
                console.warn('Failed to save personal information:', error)
                // Continue with resume creation even if personal info fails
            }
        }

        // Validate resume data before saving
        console.log('Validating resume data...')
        const validation = validateResumeForApi(resume)
        console.log('Validation result:', validation)

        if (!validation.isValid) {
            const errorMessage = `Resume validation failed: ${validation.errors.map(e => e.message).join(', ')}`
            console.error('Validation failed:', errorMessage)
            throw new ApiError(errorMessage, 400)
        }

        // Sanitize resume data for API (remove personal info from resume data)
        console.log('Sanitizing resume data...')
        const sanitizedResume = sanitizeResumeForApi(PersonalInfoExtractor.removeFromResumeData(resume))
        console.log('Sanitized resume:', sanitizedResume)

        // Try to save to database first
        let savedResume: { id: string } | null = null

        if (forceNewResume) {
            // Always create new resume version (for wizard flow)
            console.log('Creating new resume version (forced)...')
            const createdResume = await resumeVersionApi.create(sanitizedResume, companyName, jobTitle, companyEmail || 'default@company.com', jobDescription)
            console.log('Created new version successfully')
            savedResume = { id: createdResume.id }
        } else {
            // Check for existing active version (for regular updates)
            console.log('Getting active version...')
            const activeVersion = await resumeVersionApi.getActive()
            console.log('Active version:', activeVersion)

            if (activeVersion) {
                // Update existing active version
                console.log('Updating existing active version...')
                await resumeVersionApi.update(activeVersion.id, {
                    resume_data: sanitizedResume,
                    job_title: jobTitle,
                    company_name: companyName,
                    company_email: companyEmail,
                    job_description: jobDescription
                })
                console.log('Updated existing version successfully')
                savedResume = { id: activeVersion.id }
            } else {
                // Create new resume version
                console.log('Creating new resume version...')
                const createdResume = await resumeVersionApi.create(sanitizedResume, companyName, jobTitle, companyEmail || 'default@company.com', jobDescription)
                console.log('Created new version successfully')
                savedResume = { id: createdResume.id }
            }
        }

        // Also save to localStorage as backup
        console.log('Saving to localStorage as backup...')
        const resumeWithJobDescription = {
            ...sanitizedResume,
            job_description: jobDescription
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeWithJobDescription))
        console.log('Saved to localStorage successfully')

        return savedResume
    } catch (error) {
        console.error('Failed to save resume to database:', error)

        // Fallback to localStorage only
        try {
            console.log('Falling back to localStorage only...')
            const resumeWithJobDescription = {
                ...resume,
                job_description: jobDescription
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeWithJobDescription))
            console.warn('Saved to localStorage as fallback (API unavailable)')
            // Don't throw error - localStorage save was successful
            return null // No ID available in localStorage fallback
        } catch (localError) {
            console.error('Failed to save resume to localStorage:', localError)
            throw new Error('Failed to save resume to both database and localStorage')
        }
    }
}

// Load resume from database (primary) with localStorage fallback
export const loadResumeFromDatabase = async (): Promise<Resume | null> => {
    try {
        // Try to load from database first
        const activeVersion = await resumeVersionApi.getActive()

        if (activeVersion) {
            // Migrate the resume data to ensure compatibility
            const migratedResume = migrateResumeData(activeVersion.resume_data)
            // Also save to localStorage as backup
            localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedResume))
            return migratedResume
        }

        return null
    } catch (error) {
        console.error('Failed to load resume from database:', error)

        // Fallback to localStorage
        try {
            const data = localStorage.getItem(STORAGE_KEY)
            if (!data) return null

            const resumeData = JSON.parse(data)
            // Extract job_description if it exists in the stored data
            const { job_description, ...resume } = resumeData
            // Migrate the resume data to ensure compatibility
            const migratedResume = migrateResumeData(resume)
            console.warn('Loaded from localStorage as fallback (API unavailable)')
            return migratedResume
        } catch (localError) {
            console.error('Failed to load resume from localStorage:', localError)
            return null
        }
    }
}

// Clear resume from both database and localStorage
export const clearResumeFromDatabase = async (): Promise<void> => {
    try {
        // Clear from database
        const activeVersion = await resumeVersionApi.getActive()
        if (activeVersion) {
            await resumeVersionApi.delete(activeVersion.id)
        }
    } catch (error) {
        console.error('Failed to clear resume from database:', error)
    }

    // Always clear from localStorage
    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
        console.error('Failed to clear resume from localStorage:', error)
    }
}

// Legacy functions for backward compatibility (now use database)
export const saveResumeToLocalStorage = saveResumeToDatabase
export const loadResumeFromLocalStorage = loadResumeFromDatabase
export const clearResumeFromLocalStorage = clearResumeFromDatabase
