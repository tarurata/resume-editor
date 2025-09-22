import { PersonalInfo, ParsedSection, Resume, JobDescriptionExtraction, JDExtractionResponse } from '@/types/resume'

export interface AIExtractionRequest {
    text: string
    extraction_type: 'personal_info' | 'sections' | 'structured' | 'comprehensive'
    user_id?: string
}

export interface AIExtractionResponse {
    success: boolean
    data?: any
    confidence?: number
    errors?: string[]
    extraction_type: string
}

export interface AIImprovementRequest {
    content: string
    improvement_type: 'general' | 'summary' | 'experience' | 'skills'
    context?: string
    user_id?: string
}

export interface AIImprovementResponse {
    success: boolean
    improved_content?: string
    suggestions?: string[]
    confidence?: number
    errors?: string[]
}

export interface AIHealthResponse {
    status: 'healthy' | 'unhealthy'
    provider?: string
    can_use_real_ai?: boolean
    rate_limit_status?: any
    error?: string
}

class AIApiService {
    private baseUrl: string

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    }

    /**
     * Extract personal information from resume text
     */
    async extractPersonalInfo(text: string, userId?: string): Promise<PersonalInfo | null> {
        try {
            const response = await this.makeRequest('/api/ai/extract', {
                method: 'POST',
                body: JSON.stringify({
                    text,
                    extraction_type: 'personal_info',
                    user_id: userId
                })
            })

            if (response.success && response.data) {
                return {
                    name: response.data.name || undefined,
                    email: response.data.email || undefined,
                    phone: response.data.phone || undefined,
                    linkedin: response.data.linkedin || undefined,
                    github: response.data.github || undefined
                }
            }

            return null
        } catch (error) {
            console.error('AI personal info extraction failed:', error)
            return null
        }
    }

    /**
     * Extract resume sections from text
     */
    async extractResumeSections(text: string, userId?: string): Promise<ParsedSection[]> {
        try {
            const response = await this.makeRequest('/api/ai/extract', {
                method: 'POST',
                body: JSON.stringify({
                    text,
                    extraction_type: 'sections',
                    user_id: userId
                })
            })

            if (response.success && Array.isArray(response.data)) {
                return response.data.map((section: any) => ({
                    type: section.type || 'experience',
                    content: section.content || '',
                    startIndex: section.startIndex || 0,
                    endIndex: section.endIndex || 0
                }))
            }

            return []
        } catch (error) {
            console.error('AI section extraction failed:', error)
            return []
        }
    }

    /**
     * Extract structured resume data
     */
    async extractStructuredResume(text: string, userId?: string): Promise<Partial<Resume>> {
        try {
            const response = await this.makeRequest('/api/ai/extract', {
                method: 'POST',
                body: JSON.stringify({
                    text,
                    extraction_type: 'structured',
                    user_id: userId
                })
            })

            if (response.success && response.data) {
                return {
                    title: response.data.title || '',
                    summary: response.data.summary || '',
                    experience: response.data.experience || [],
                    education: response.data.education || [],
                    skills: response.data.skills || []
                }
            }

            return {
                title: '',
                summary: '',
                experience: [],
                education: [],
                skills: []
            }
        } catch (error) {
            console.error('AI structured extraction failed:', error)
            return {
                title: '',
                summary: '',
                experience: [],
                education: [],
                skills: []
            }
        }
    }

    /**
     * Comprehensive resume extraction
     */
    async extractComprehensiveResume(text: string, userId?: string): Promise<{
        personalInfo: PersonalInfo | null
        sections: ParsedSection[]
        structuredResume: Partial<Resume>
        confidence: number
        errors: string[]
    }> {
        try {
            const response = await this.makeRequest('/api/ai/extract', {
                method: 'POST',
                body: JSON.stringify({
                    text,
                    extraction_type: 'comprehensive',
                    user_id: userId
                })
            })

            if (response.success && response.data) {
                return {
                    personalInfo: response.data.personal_info ? {
                        name: response.data.personal_info.name || undefined,
                        email: response.data.personal_info.email || undefined,
                        phone: response.data.personal_info.phone || undefined,
                        linkedin: response.data.personal_info.linkedin || undefined,
                        github: response.data.personal_info.github || undefined
                    } : null,
                    sections: response.data.sections || [],
                    structuredResume: response.data.structured_resume || {},
                    confidence: response.confidence || 0,
                    errors: response.errors || []
                }
            }

            return {
                personalInfo: null,
                sections: [],
                structuredResume: {},
                confidence: 0,
                errors: response.errors || ['Extraction failed']
            }
        } catch (error) {
            console.error('AI comprehensive extraction failed:', error)
            return {
                personalInfo: null,
                sections: [],
                structuredResume: {},
                confidence: 0,
                errors: [error instanceof Error ? error.message : 'Unknown error']
            }
        }
    }

    /**
     * Improve resume content
     */
    async improveContent(
        content: string,
        improvementType: 'general' | 'summary' | 'experience' | 'skills' = 'general',
        context?: string,
        userId?: string
    ): Promise<{
        improvedContent?: string
        suggestions?: string[]
        confidence?: number
        errors?: string[]
    }> {
        try {
            const response = await this.makeRequest('/api/ai/improve', {
                method: 'POST',
                body: JSON.stringify({
                    content,
                    improvement_type: improvementType,
                    context,
                    user_id: userId
                })
            })

            if (response.success) {
                return {
                    improvedContent: response.improved_content,
                    suggestions: response.suggestions,
                    confidence: response.confidence,
                    errors: response.errors
                }
            }

            return {
                errors: response.errors || ['Improvement failed']
            }
        } catch (error) {
            console.error('AI content improvement failed:', error)
            return {
                errors: [error instanceof Error ? error.message : 'Unknown error']
            }
        }
    }

    /**
     * Extract information from job description
     */
    async extractJobDescription(jobDescription: string, userId?: string): Promise<JDExtractionResponse> {
        try {
            const response = await this.makeRequest('/api/ai/extract-jd', {
                method: 'POST',
                body: JSON.stringify({
                    job_description: jobDescription,
                    user_id: userId
                })
            })

            return {
                success: response.success,
                data: response.data,
                confidence: response.confidence,
                errors: response.errors
            }
        } catch (error) {
            console.error('JD extraction failed:', error)
            return {
                success: false,
                data: undefined,
                confidence: 0,
                errors: [error instanceof Error ? error.message : 'Unknown error']
            }
        }
    }

    /**
     * Check AI service health
     */
    async getHealthStatus(): Promise<AIHealthResponse> {
        try {
            const response = await this.makeRequest('/api/ai/health', {
                method: 'GET'
            })

            return response
        } catch (error) {
            console.error('AI health check failed:', error)
            return {
                status: 'unhealthy',
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        }
    }

    /**
     * Make HTTP request to API
     */
    private async makeRequest(endpoint: string, options: RequestInit): Promise<any> {
        const url = `${this.baseUrl}${endpoint}`

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        })

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }

        return await response.json()
    }
}

// Export singleton instance
export const aiApiService = new AIApiService()
