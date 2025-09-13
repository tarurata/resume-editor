import { ApiError } from './api'

// Types for experiences and achievements
export interface Experience {
    id: string
    resume_version_id: string
    role: string
    organization: string
    location?: string
    start_date: string
    end_date?: string
    order_index: number
    created_at: string
    updated_at: string
}

export interface Achievement {
    id: string
    experience_id: string
    achievement_text: string
    order_index: number
    created_at: string
    updated_at: string
}

export interface ExperienceCreate {
    resume_version_id: string
    role: string
    organization: string
    location?: string
    start_date: string
    end_date?: string
    order_index: number
}

export interface AchievementCreate {
    experience_id: string
    achievement_text: string
    order_index: number
}

export interface ExperienceUpdate {
    role?: string
    organization?: string
    location?: string
    start_date?: string
    end_date?: string
    order_index?: number
}

export interface AchievementUpdate {
    achievement_text?: string
    order_index?: number
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

// Generic API request function
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const defaultHeaders = {
        'Content-Type': 'application/json',
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        })

        const data = response.ok ? await response.json() : null

        if (!response.ok) {
            const errorMessage = data?.detail || `HTTP ${response.status}: ${response.statusText}`
            throw new ApiError(errorMessage, response.status, data)
        }

        return data
    } catch (error) {
        if (error instanceof ApiError) {
            throw error
        }

        // Network or other errors
        throw new ApiError(
            error instanceof Error ? error.message : 'Network error',
            0
        )
    }
}

// Experience API functions
export const experienceApi = {
    // Create a new experience
    async create(experience: ExperienceCreate): Promise<Experience> {
        return apiRequest<Experience>('/experiences/', {
            method: 'POST',
            body: JSON.stringify(experience),
        })
    },

    // Get all experiences for a resume version
    async getByResumeVersion(resumeVersionId: string): Promise<Experience[]> {
        return apiRequest<Experience[]>(`/experiences/resume/${resumeVersionId}`)
    },

    // Get specific experience
    async getById(experienceId: string): Promise<Experience> {
        return apiRequest<Experience>(`/experiences/${experienceId}`)
    },

    // Update experience
    async update(experienceId: string, updates: ExperienceUpdate): Promise<Experience> {
        return apiRequest<Experience>(`/experiences/${experienceId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        })
    },

    // Delete experience
    async delete(experienceId: string): Promise<void> {
        await apiRequest(`/experiences/${experienceId}`, {
            method: 'DELETE',
        })
    },

    // Get experiences with achievements
    async getWithAchievements(resumeVersionId: string): Promise<any[]> {
        return apiRequest<any[]>(`/experiences/resume/${resumeVersionId}/with-achievements`)
    }
}

// Achievement API functions
export const achievementApi = {
    // Create a new achievement
    async create(experienceId: string, achievement: Omit<AchievementCreate, 'experience_id'>): Promise<Achievement> {
        return apiRequest<Achievement>(`/experiences/${experienceId}/achievements`, {
            method: 'POST',
            body: JSON.stringify(achievement),
        })
    },

    // Get all achievements for an experience
    async getByExperience(experienceId: string): Promise<Achievement[]> {
        return apiRequest<Achievement[]>(`/experiences/${experienceId}/achievements`)
    },

    // Get specific achievement
    async getById(achievementId: string): Promise<Achievement> {
        return apiRequest<Achievement>(`/experiences/achievements/${achievementId}`)
    },

    // Update achievement
    async update(achievementId: string, updates: AchievementUpdate): Promise<Achievement> {
        return apiRequest<Achievement>(`/experiences/achievements/${achievementId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        })
    },

    // Delete achievement
    async delete(achievementId: string): Promise<void> {
        await apiRequest(`/experiences/achievements/${achievementId}`, {
            method: 'DELETE',
        })
    }
}

// Helper function to sync experiences and achievements with database
export const syncExperiencesToDatabase = async (
    resumeVersionId: string,
    experiences: any[]
): Promise<void> => {
    try {
        console.log('Syncing experiences to database:', { resumeVersionId, experiences })

        // Get existing experiences from database
        const existingExperiences = await experienceApi.getByResumeVersion(resumeVersionId)
        console.log('Existing experiences:', existingExperiences)

        // Create a map of existing experiences by their order index
        const existingMap = new Map(existingExperiences.map(exp => [exp.order_index, exp]))

        // Process each experience from the frontend
        for (let i = 0; i < experiences.length; i++) {
            const exp = experiences[i]
            const existingExp = existingMap.get(i)

            if (existingExp) {
                // Update existing experience
                console.log('Updating existing experience:', existingExp.id)
                await experienceApi.update(existingExp.id, {
                    role: exp.role,
                    organization: exp.organization,
                    location: exp.location,
                    start_date: exp.startDate,
                    end_date: exp.endDate,
                    order_index: i
                })

                // Update achievements for this experience
                if (exp.bullets && exp.bullets.length > 0) {
                    const existingAchievements = await achievementApi.getByExperience(existingExp.id)

                    // Delete existing achievements
                    for (const achievement of existingAchievements) {
                        await achievementApi.delete(achievement.id)
                    }

                    // Create new achievements
                    for (let j = 0; j < exp.bullets.length; j++) {
                        if (exp.bullets[j].trim()) {
                            await achievementApi.create(existingExp.id, {
                                achievement_text: exp.bullets[j],
                                order_index: j
                            })
                        }
                    }
                }
            } else {
                // Create new experience
                console.log('Creating new experience for index:', i)
                const newExp = await experienceApi.create({
                    resume_version_id: resumeVersionId,
                    role: exp.role,
                    organization: exp.organization,
                    location: exp.location,
                    start_date: exp.startDate,
                    end_date: exp.endDate,
                    order_index: i
                })

                // Create achievements for this experience
                if (exp.bullets && exp.bullets.length > 0) {
                    for (let j = 0; j < exp.bullets.length; j++) {
                        if (exp.bullets[j].trim()) {
                            await achievementApi.create(newExp.id, {
                                achievement_text: exp.bullets[j],
                                order_index: j
                            })
                        }
                    }
                }
            }
        }

        // Delete any remaining experiences that are no longer in the frontend data
        const frontendIndices = new Set(Array.from({ length: experiences.length }, (_, i) => i))
        for (const existingExp of existingExperiences) {
            if (!frontendIndices.has(existingExp.order_index)) {
                console.log('Deleting experience:', existingExp.id)
                await experienceApi.delete(existingExp.id)
            }
        }

        console.log('Successfully synced experiences to database')

    } catch (error) {
        console.error('Failed to sync experiences to database:', error)
        throw error
    }
}
