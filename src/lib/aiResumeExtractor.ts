import { getAIService } from './llm/aiService'
import { PersonalInfo, ParsedSection, Resume } from '@/types/resume'

export interface AIExtractionResult {
    personalInfo: PersonalInfo | null
    sections: ParsedSection[]
    structuredResume: Partial<Resume>
    confidence: number
    errors: string[]
}

export class AIResumeExtractor {
    private get aiService() {
        return getAIService()
    }

    /**
     * Clean and extract JSON from AI response
     */
    private extractJSON(text: string, expectedType: 'object' | 'array'): string | null {
        let cleaned = text.trim()

        if (expectedType === 'object') {
            // Look for JSON object
            const firstBrace = cleaned.indexOf('{')
            const lastBrace = cleaned.lastIndexOf('}')

            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                cleaned = cleaned.substring(firstBrace, lastBrace + 1)
            } else {
                return null
            }
        } else if (expectedType === 'array') {
            // Look for JSON array
            const firstBracket = cleaned.indexOf('[')
            const lastBracket = cleaned.lastIndexOf(']')

            if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
                cleaned = cleaned.substring(firstBracket, lastBracket + 1)
            } else {
                return null
            }
        }

        // Additional cleaning for common issues
        cleaned = cleaned
            .replace(/^[^{[]*/, '') // Remove text before JSON
            .replace(/[^}\]]*$/, '') // Remove text after JSON
            .trim()

        return cleaned
    }

    /**
     * Validate if text is valid JSON
     */
    private isValidJSON(text: string): boolean {
        try {
            JSON.parse(text)
            return true
        } catch {
            return false
        }
    }

    /**
     * Check if we're using mock provider
     */
    private isUsingMockProvider(): boolean {
        try {
            const config = this.aiService.getConfig()
            return config.provider === 'mock'
        } catch {
            return true
        }
    }

    /**
     * Extract personal information using AI
     */
    async extractPersonalInfo(text: string): Promise<PersonalInfo | null> {
        // If using mock provider, skip AI and use regex fallback
        if (this.isUsingMockProvider()) {
            console.log('Using mock provider, skipping AI extraction for personal info')
            return null
        }

        const prompt = `Extract personal information from resume text. Return ONLY valid JSON.

Format:
{"name": "Full Name", "email": "email@example.com", "phone": "+1234567890", "linkedin": "https://linkedin.com/in/username", "github": "https://github.com/username"}

Rules:
- Return ONLY JSON, no explanations
- Use null for missing fields
- Only include clearly present information

Text:
${text}

JSON:`

        let response: any = null
        try {
            response = await this.aiService.generate(prompt, {
                temperature: 0.1,
                maxTokens: 300
            })

            // Clean the response to extract JSON
            const jsonText = this.extractJSON(response.text, 'object')

            if (!jsonText || !this.isValidJSON(jsonText)) {
                console.warn('AI returned invalid JSON for personal info:', response.text)
                return null
            }

            const extracted = JSON.parse(jsonText)

            // Validate that we have at least name or email
            if (!extracted.name && !extracted.email) {
                return null
            }

            return {
                name: extracted.name || undefined,
                email: extracted.email || undefined,
                phone: extracted.phone || undefined,
                linkedin: extracted.linkedin || undefined,
                github: extracted.github || undefined
            }
        } catch (error) {
            console.error('AI personal info extraction failed:', error)
            console.error('Response text:', response?.text)
            return null
        }
    }

    /**
     * Extract and structure resume sections using AI
     */
    async extractResumeSections(text: string): Promise<ParsedSection[]> {
        // If using mock provider, skip AI and use regex fallback
        if (this.isUsingMockProvider()) {
            console.log('Using mock provider, skipping AI extraction for sections')
            return []
        }

        const prompt = `Extract resume sections. Return ONLY valid JSON array.

Format:
[{"type": "title", "content": "text", "startIndex": 0, "endIndex": 50}]

Types: title, summary, experience, skills, education, certifications

Rules:
- Return ONLY JSON array, no explanations
- "title" = person's name (first line)
- "summary" = professional summary/objective
- "experience" = work experience entries
- "skills" = technical skills/technologies
- "education" = degrees/schools
- "certifications" = professional certifications

Text:
${text}

JSON:`

        let response: any = null
        try {
            response = await this.aiService.generate(prompt, {
                temperature: 0.1,
                maxTokens: 1000
            })

            // Clean the response to extract JSON
            const jsonText = this.extractJSON(response.text, 'array')

            if (!jsonText || !this.isValidJSON(jsonText)) {
                console.warn('AI returned invalid JSON for sections:', response.text)
                return []
            }

            const sections = JSON.parse(jsonText)

            // Validate sections structure
            if (!Array.isArray(sections)) {
                throw new Error('AI returned non-array response')
            }

            return sections.map((section: any, index: number) => ({
                type: section.type || 'experience',
                content: section.content || '',
                startIndex: typeof section.startIndex === 'number' ? section.startIndex : index * 100,
                endIndex: typeof section.endIndex === 'number' ? section.endIndex : (index + 1) * 100
            }))
        } catch (error) {
            console.error('AI section extraction failed:', error)
            console.error('Response text:', response?.text)
            return []
        }
    }

    /**
     * Extract structured resume data using AI
     */
    async extractStructuredResume(text: string): Promise<Partial<Resume>> {
        // If using mock provider, skip AI and use regex fallback
        if (this.isUsingMockProvider()) {
            console.log('Using mock provider, skipping AI extraction for structured resume')
            return {
                title: '',
                summary: '',
                experience: [],
                education: [],
                skills: []
            }
        }

        const prompt = `Extract structured resume data. Return ONLY valid JSON.

Format:
{"title": "name", "summary": "text", "experience": [{"role": "title", "organization": "company", "startDate": "2020-01", "endDate": "2023-12", "achievements": ["achievement"]}], "education": [{"degree": "degree", "school": "school", "graduationDate": "2020-05"}], "skills": [{"name": "category", "skills": ["skill1", "skill2"]}]}

Rules:
- Return ONLY JSON, no explanations
- Use YYYY-MM format for dates
- Extract 3-5 achievements per job
- Group skills into categories

Text:
${text}

JSON:`

        let response: any = null
        try {
            response = await this.aiService.generate(prompt, {
                temperature: 0.1,
                maxTokens: 1500
            })

            // Clean the response to extract JSON
            const jsonText = this.extractJSON(response.text, 'object')

            if (!jsonText || !this.isValidJSON(jsonText)) {
                console.warn('AI returned invalid JSON for structured resume:', response.text)
                return {
                    title: '',
                    summary: '',
                    experience: [],
                    education: [],
                    skills: []
                }
            }

            const resume = JSON.parse(jsonText)

            // Validate and clean the response
            return {
                title: resume.title || '',
                summary: resume.summary || '',
                experience: Array.isArray(resume.experience) ? resume.experience : [],
                education: Array.isArray(resume.education) ? resume.education : [],
                skills: Array.isArray(resume.skills) ? resume.skills : []
            }
        } catch (error) {
            console.error('AI structured extraction failed:', error)
            console.error('Response text:', response?.text)
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
     * Comprehensive AI-powered resume extraction
     */
    async extractResume(text: string): Promise<AIExtractionResult> {
        const errors: string[] = []
        let personalInfo: PersonalInfo | null = null
        let sections: ParsedSection[] = []
        let structuredResume: Partial<Resume> = {}
        let confidence = 0

        try {
            // Extract personal information
            try {
                personalInfo = await this.extractPersonalInfo(text)
                if (personalInfo) confidence += 0.3
            } catch (error) {
                errors.push('Personal info extraction failed')
            }

            // Extract sections
            try {
                sections = await this.extractResumeSections(text)
                if (sections.length > 0) confidence += 0.4
            } catch (error) {
                errors.push('Section extraction failed')
            }

            // Extract structured resume
            try {
                structuredResume = await this.extractStructuredResume(text)
                if (structuredResume.title || structuredResume.summary) confidence += 0.3
            } catch (error) {
                errors.push('Structured extraction failed')
            }

        } catch (error) {
            errors.push('AI extraction failed completely')
            console.error('AI resume extraction error:', error)
        }

        return {
            personalInfo,
            sections,
            structuredResume,
            confidence,
            errors
        }
    }

    /**
     * Fallback to regex-based extraction if AI fails
     */
    fallbackToRegex(text: string): AIExtractionResult {
        // Import the existing regex-based extractor
        const { PersonalInfoExtractor } = require('./personalInfoExtractor')

        const personalInfo = PersonalInfoExtractor.extractFromText(text)

        // Simple regex-based section detection
        const sections: ParsedSection[] = []
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

        lines.forEach((line, index) => {
            const startIndex = text.indexOf(line)
            const endIndex = startIndex + line.length

            if (index === 0) {
                sections.push({
                    type: 'title',
                    content: line,
                    startIndex,
                    endIndex
                })
            } else if (line.toLowerCase().includes('summary') || line.toLowerCase().includes('objective')) {
                sections.push({
                    type: 'summary',
                    content: line,
                    startIndex,
                    endIndex
                })
            } else if (line.toLowerCase().includes('experience') || line.toLowerCase().includes('work')) {
                sections.push({
                    type: 'experience',
                    content: line,
                    startIndex,
                    endIndex
                })
            } else if (line.toLowerCase().includes('skills') || line.toLowerCase().includes('technologies')) {
                sections.push({
                    type: 'skills',
                    content: line,
                    startIndex,
                    endIndex
                })
            } else if (line.toLowerCase().includes('education') || line.toLowerCase().includes('degree')) {
                sections.push({
                    type: 'education',
                    content: line,
                    startIndex,
                    endIndex
                })
            }
        })

        return {
            personalInfo,
            sections,
            structuredResume: {
                title: personalInfo?.name || '',
                summary: '',
                experience: [],
                education: [],
                skills: []
            },
            confidence: 0.2, // Low confidence for regex fallback
            errors: ['Using regex fallback due to AI failure']
        }
    }
}

// Export singleton instance
export const aiResumeExtractor = new AIResumeExtractor()
