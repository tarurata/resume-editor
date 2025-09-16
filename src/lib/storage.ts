import { Resume, PersonalInfo } from '@/types/resume'
import { resumeVersionApi, personalInfoApi, ApiError } from './api'
import { validateResumeForApi, sanitizeResumeForApi } from './validation'
import { PersonalInfoExtractor } from './personalInfoExtractor'

// Fallback to localStorage for offline mode or when API is unavailable
const STORAGE_KEY = 'resume-editor-data'

// Save resume to database (primary) with localStorage fallback
export const saveResumeToDatabase = async (
    resume: Resume,
    companyName: string = 'Default Company',
    jobTitle: string = 'Software Engineer',
    companyEmail?: string,
    jobDescription?: string,
    extractedPersonalInfo?: PersonalInfo | null
): Promise<void> => {
    console.log('saveResumeToDatabase called with:', { resume, companyName, jobTitle })

    try {
        // Handle personal information extraction and creation
        let personalInfoToSave = extractedPersonalInfo

        // If no personal info provided, try to extract from resume data
        if (!personalInfoToSave) {
            personalInfoToSave = PersonalInfoExtractor.extractFromResumeData(resume)
        }

        // Create or update personal information if we have it
        if (personalInfoToSave) {
            try {
                console.log('Creating/updating personal information...')
                const existingPersonalInfo = await personalInfoApi.get()

                if (existingPersonalInfo) {
                    // Update existing personal info
                    await personalInfoApi.update({
                        full_name: personalInfoToSave.name || existingPersonalInfo.full_name,
                        email: personalInfoToSave.email || existingPersonalInfo.email,
                        phone: personalInfoToSave.phone || existingPersonalInfo.phone,
                        location: existingPersonalInfo.location, // Keep existing location
                        linkedin_url: personalInfoToSave.linkedin || existingPersonalInfo.linkedin_url,
                        portfolio_url: personalInfoToSave.github || existingPersonalInfo.portfolio_url
                    })
                    console.log('Updated personal information successfully')
                } else {
                    // Create new personal info
                    await personalInfoApi.create({
                        full_name: personalInfoToSave.name || 'Unknown',
                        email: personalInfoToSave.email || 'unknown@example.com',
                        phone: personalInfoToSave.phone,
                        location: undefined, // Not in PersonalInfo interface
                        linkedin_url: personalInfoToSave.linkedin,
                        portfolio_url: personalInfoToSave.github
                    })
                    console.log('Created personal information successfully')
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
        console.log('Education data before sanitization:', resume.education)
        const sanitizedResume = sanitizeResumeForApi(PersonalInfoExtractor.removeFromResumeData(resume))
        console.log('Sanitized resume:', sanitizedResume)
        console.log('Education data after sanitization:', sanitizedResume.education)

        // Try to save to database first
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
        } else {
            // Create new resume version
            console.log('Creating new resume version...')
            await resumeVersionApi.create(sanitizedResume, companyName, jobTitle, companyEmail || 'default@company.com', jobDescription)
            console.log('Created new version successfully')
        }

        // Also save to localStorage as backup
        console.log('Saving to localStorage as backup...')
        const resumeWithJobDescription = {
            ...sanitizedResume,
            job_description: jobDescription
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeWithJobDescription))
        console.log('Saved to localStorage successfully')
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
            return
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
            // Also save to localStorage as backup
            localStorage.setItem(STORAGE_KEY, JSON.stringify(activeVersion.resume_data))
            return activeVersion.resume_data
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
            console.warn('Loaded from localStorage as fallback (API unavailable)')
            return resume as Resume
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
