import { Resume } from '@/types/resume'
import { resumeVersionApi, ApiError } from './api'
import { validateResumeForApi, sanitizeResumeForApi } from './validation'

// Fallback to localStorage for offline mode or when API is unavailable
const STORAGE_KEY = 'resume-editor-data'

// Save resume to database (primary) with localStorage fallback
export const saveResumeToDatabase = async (
    resume: Resume,
    companyName: string = 'Default Company',
    jobTitle: string = 'Software Engineer'
): Promise<void> => {
    console.log('saveResumeToDatabase called with:', { resume, companyName, jobTitle })

    try {
        // Validate resume data before saving
        console.log('Validating resume data...')
        const validation = validateResumeForApi(resume)
        console.log('Validation result:', validation)

        if (!validation.isValid) {
            const errorMessage = `Resume validation failed: ${validation.errors.map(e => e.message).join(', ')}`
            console.error('Validation failed:', errorMessage)
            throw new ApiError(errorMessage, 400)
        }

        // Sanitize resume data for API
        console.log('Sanitizing resume data...')
        const sanitizedResume = sanitizeResumeForApi(resume)
        console.log('Sanitized resume:', sanitizedResume)

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
                company_name: companyName
            })
            console.log('Updated existing version successfully')
        } else {
            // Create new resume version
            console.log('Creating new resume version...')
            await resumeVersionApi.create(sanitizedResume, companyName, jobTitle, 'default@company.com')
            console.log('Created new version successfully')
        }

        // Also save to localStorage as backup
        console.log('Saving to localStorage as backup...')
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedResume))
        console.log('Saved to localStorage successfully')
    } catch (error) {
        console.error('Failed to save resume to database:', error)

        // Fallback to localStorage only
        try {
            console.log('Falling back to localStorage only...')
            localStorage.setItem(STORAGE_KEY, JSON.stringify(resume))
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

            const resume = JSON.parse(data) as Resume
            console.warn('Loaded from localStorage as fallback (API unavailable)')
            return resume
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
