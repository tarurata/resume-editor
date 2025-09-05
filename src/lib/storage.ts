import { Resume } from '@/types/resume'

const STORAGE_KEY = 'resume-editor-data'

export const saveResumeToLocalStorage = async (resume: Resume): Promise<void> => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resume))
    } catch (error) {
        console.error('Failed to save resume to localStorage:', error)
        throw new Error('Failed to save resume to localStorage')
    }
}

export const loadResumeFromLocalStorage = (): Resume | null => {
    try {
        const data = localStorage.getItem(STORAGE_KEY)
        if (!data) return null

        const resume = JSON.parse(data) as Resume
        return resume
    } catch (error) {
        console.error('Failed to load resume from localStorage:', error)
        return null
    }
}

export const clearResumeFromLocalStorage = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
        console.error('Failed to clear resume from localStorage:', error)
    }
}
