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
    private aiService = getAIService()

    /**
     * Extract personal information using AI
     */
    async extractPersonalInfo(text: string): Promise<PersonalInfo | null> {
        const prompt = `You are a resume parser. Extract personal information from the following resume text and return ONLY a valid JSON object.

Required JSON format:
{
  "name": "Full Name",
  "email": "email@example.com", 
  "phone": "+1234567890",
  "linkedin": "https://linkedin.com/in/username",
  "github": "https://github.com/username"
}

Rules:
- Return ONLY the JSON object, no other text
- Use null for missing fields
- Only include fields that are clearly present in the text
- Ensure the JSON is valid and parseable

Resume text:
${text}

JSON:`

        try {
            const response = await this.aiService.generate(prompt, {
                temperature: 0.1,
                maxTokens: 500
            })

            // Clean the response to extract JSON
            let jsonText = response.text.trim()
            
            // Remove any text before the first { or after the last }
            const firstBrace = jsonText.indexOf('{')
            const lastBrace = jsonText.lastIndexOf('}')
            
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                jsonText = jsonText.substring(firstBrace, lastBrace + 1)
            }
            
            // Try to parse the cleaned JSON
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
        const prompt = `You are a resume parser. Analyze the following resume text and extract structured sections. Return ONLY a valid JSON array.

Required JSON format:
[
  {
    "type": "title" | "summary" | "experience" | "skills" | "education" | "certifications",
    "content": "The actual text content of this section",
    "startIndex": 0,
    "endIndex": 50
  }
]

Rules:
- Return ONLY the JSON array, no other text
- "title" should be the person's name or resume title (usually first line)
- "summary" should be professional summary, objective, or profile
- "experience" should be work experience entries (job titles, companies, dates, descriptions)
- "skills" should be technical skills, technologies, or competencies
- "education" should be degrees, schools, graduation dates
- "certifications" should be professional certifications or licenses
- For each section, provide the exact text content and calculate startIndex/endIndex based on position in the original text

Resume text:
${text}

JSON:`

        try {
            const response = await this.aiService.generate(prompt, {
                temperature: 0.1,
                maxTokens: 2000
            })

            // Clean the response to extract JSON
            let jsonText = response.text.trim()
            
            // Remove any text before the first [ or after the last ]
            const firstBracket = jsonText.indexOf('[')
            const lastBracket = jsonText.lastIndexOf(']')
            
            if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
                jsonText = jsonText.substring(firstBracket, lastBracket + 1)
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
        const prompt = `You are a resume parser. Extract structured resume data from the following text and return ONLY a valid JSON object.

Required JSON format:
{
  "title": "Resume title or person's name",
  "summary": "Professional summary or objective",
  "experience": [
    {
      "role": "Job Title",
      "organization": "Company Name",
      "startDate": "2020-01",
      "endDate": "2023-12" or null for current,
      "bullets": ["Achievement 1", "Achievement 2"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "school": "School Name",
      "graduationDate": "2020-05"
    }
  ],
  "skills": [
    {
      "name": "Category Name",
      "skills": ["Skill 1", "Skill 2", "Skill 3"]
    }
  ]
}

Rules:
- Return ONLY the JSON object, no other text
- Use YYYY-MM format for dates
- Extract 3-5 key achievements per job
- Group skills into logical categories (Technical Skills, Languages, etc.)
- Only include information that's clearly present in the text
- Use null for missing optional fields

Resume text:
${text}

JSON:`

        try {
            const response = await this.aiService.generate(prompt, {
                temperature: 0.1,
                maxTokens: 3000
            })

            // Clean the response to extract JSON
            let jsonText = response.text.trim()
            
            // Remove any text before the first { or after the last }
            const firstBrace = jsonText.indexOf('{')
            const lastBrace = jsonText.lastIndexOf('}')
            
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                jsonText = jsonText.substring(firstBrace, lastBrace + 1)
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
