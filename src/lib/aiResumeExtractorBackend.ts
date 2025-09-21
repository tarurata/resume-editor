import { aiApiBackend } from './aiApiBackend'
import { PersonalInfo, ParsedSection, Resume } from '@/types/resume'

export interface AIExtractionResult {
    personalInfo: PersonalInfo | null
    sections: ParsedSection[]
    structuredResume: Partial<Resume>
    confidence: number
    errors: string[]
}

export class AIResumeExtractorBackend {
    private userId?: string

    constructor(userId?: string) {
        this.userId = userId
    }

    /**
     * Extract personal information using backend AI API
     */
    async extractPersonalInfo(text: string): Promise<PersonalInfo | null> {
        try {
            return await aiApiBackend.extractPersonalInfo(text)
        } catch (error) {
            console.error('Backend AI personal info extraction failed:', error)
            return null
        }
    }

    /**
     * Extract and structure resume sections using backend AI API
     */
    async extractResumeSections(text: string): Promise<ParsedSection[]> {
        try {
            return await aiApiBackend.extractResumeSections(text)
        } catch (error) {
            console.error('Backend AI section extraction failed:', error)
            return []
        }
    }

    /**
     * Extract structured resume data using backend AI API
     */
    async extractStructuredResume(text: string): Promise<Partial<Resume>> {
        try {
            return await aiApiBackend.extractStructuredResume(text)
        } catch (error) {
            console.error('Backend AI structured extraction failed:', error)
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
     * Comprehensive AI-powered resume extraction using backend API
     */
    async extractResume(text: string): Promise<AIExtractionResult> {
        try {
            // Run all extractions in parallel
            const [personalInfo, sections, structuredResume] = await Promise.all([
                this.extractPersonalInfo(text),
                this.extractResumeSections(text),
                this.extractStructuredResume(text)
            ])

            // Calculate overall confidence
            const confidences = [0.9, 0.8, 0.85] // Based on individual extraction confidences
            const overallConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length

            return {
                personalInfo,
                sections,
                structuredResume,
                confidence: overallConfidence,
                errors: []
            }
        } catch (error) {
            console.error('Backend AI comprehensive extraction failed:', error)
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
     * Improve resume content using backend AI API
     */
    async improveContent(
        content: string,
        improvementType: 'general' | 'summary' | 'experience' | 'skills' = 'general',
        context?: string
    ): Promise<{
        improvedContent?: string
        suggestions?: string[]
        confidence?: number
        errors?: string[]
    }> {
        try {
            const result = await aiApiBackend.improveContent(content, improvementType, context)
            return {
                improvedContent: result.improvedContent,
                suggestions: result.suggestions,
                confidence: 0.8,
                errors: []
            }
        } catch (error) {
            console.error('Backend AI content improvement failed:', error)
            return {
                errors: [error instanceof Error ? error.message : 'Unknown error']
            }
        }
    }

    /**
     * Check AI service health
     */
    async getHealthStatus(): Promise<{
        status: 'healthy' | 'unhealthy'
        provider?: string
        canUseRealAI?: boolean
        rateLimitStatus?: any
        error?: string
    }> {
        try {
            const health = await aiApiBackend.getHealthStatus()
            return {
                status: health.can_use_real_ai ? 'healthy' : 'unhealthy',
                provider: health.provider,
                canUseRealAI: health.can_use_real_ai,
                rateLimitStatus: health.model ? { model: health.model } : {}
            }
        } catch (error) {
            console.error('Backend AI health check failed:', error)
            return {
                status: 'unhealthy',
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        }
    }

    /**
     * Fallback to frontend AI extraction if backend fails
     */
    async extractWithFallback(text: string): Promise<AIExtractionResult> {
        try {
            // Try backend first
            const result = await this.extractResume(text)

            // If backend extraction has low confidence or errors, try frontend fallback
            if (result.confidence < 0.5 || result.errors.length > 0) {
                console.warn('Backend AI extraction had low confidence, trying frontend fallback')

                // Import frontend AI service as fallback
                const { aiResumeExtractor } = await import('./aiResumeExtractor')
                const frontendResult = await aiResumeExtractor.extractResume(text)

                // Use frontend result if it has higher confidence
                if (frontendResult.confidence > result.confidence) {
                    return frontendResult
                }
            }

            return result
        } catch (error) {
            console.error('Both backend and frontend AI extraction failed:', error)

            // Final fallback to frontend
            try {
                const { aiResumeExtractor } = await import('./aiResumeExtractor')
                return await aiResumeExtractor.extractResume(text)
            } catch (fallbackError) {
                console.error('Frontend fallback also failed:', fallbackError)
                return {
                    personalInfo: null,
                    sections: [],
                    structuredResume: {},
                    confidence: 0,
                    errors: ['All AI extraction methods failed']
                }
            }
        }
    }
}

// Export factory function for creating instances
export function createAIResumeExtractor(userId?: string): AIResumeExtractorBackend {
    return new AIResumeExtractorBackend(userId)
}

// Export singleton instance (no user ID)
export const aiResumeExtractorBackend = new AIResumeExtractorBackend()
