import { PersonalInfo, ParsedSection, Resume } from '@/types/resume'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface LLMRequest {
    prompt: string
    temperature?: number
    max_tokens?: number
    model?: string
}

interface LLMResponse {
    text: string
    usage?: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
    }
    model?: string
    finish_reason?: string
}

class BackendLLMService {
    private async callLLM(request: LLMRequest): Promise<LLMResponse> {
        const response = await fetch(`${API_URL}/api/v1/llm/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request)
        })

        if (!response.ok) {
            throw new Error(`LLM API call failed: ${response.status} ${response.statusText}`)
        }

        return response.json()
    }

    async generate(prompt: string, params: { temperature?: number; maxTokens?: number; model?: string } = {}): Promise<{ text: string }> {
        const response = await this.callLLM({
            prompt,
            temperature: params.temperature || 0.7,
            max_tokens: params.maxTokens || 1000,
            model: params.model
        })

        return { text: response.text }
    }

    async getHealthStatus(): Promise<{ provider: string; can_use_real_ai: boolean; model?: string }> {
        const response = await fetch(`${API_URL}/api/v1/llm/health`)

        if (!response.ok) {
            throw new Error(`Health check failed: ${response.status}`)
        }

        return response.json()
    }
}

// Create a singleton instance
const backendLLMService = new BackendLLMService()

export const aiApiBackend = {
    async extractPersonalInfo(text: string): Promise<PersonalInfo | null> {
        const prompt = `Extract personal information from the following resume text. Return a JSON object with the following structure:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+1234567890",
  "linkedin": "https://linkedin.com/in/username",
  "github": "https://github.com/username"
}

Only include fields that are clearly present in the text. Use null for missing fields.

Resume text:
${text}

Extract personal information:`

        try {
            const response = await backendLLMService.generate(prompt, {
                temperature: 0.1,
                maxTokens: 500
            })

            const extracted = JSON.parse(response.text)

            // Validate that we have at least name or email
            if (!extracted.name && !extracted.email) {
                return null
            }

            return extracted as PersonalInfo
        } catch (error) {
            console.error('Backend AI personal info extraction failed:', error)
            return null
        }
    },

    async extractResumeSections(text: string): Promise<ParsedSection[]> {
        const prompt = `Analyze the following resume text and extract structured sections. Return a JSON array where each object has:
{
  "type": "title" | "summary" | "experience" | "skills" | "education" | "certifications",
  "content": "The actual text content of this section",
  "startIndex": 0,
  "endIndex": 50
}

Rules:
- "title" should be the person's name or resume title (usually first line)
- "summary" should be professional summary, objective, or profile
- "experience" should be work experience entries (job titles, companies, dates, descriptions)
- "skills" should be technical skills, technologies, or competencies
- "education" should be degrees, schools, graduation dates
- "certifications" should be professional certifications or licenses

For each section, provide the exact text content and calculate startIndex/endIndex based on position in the original text.

Resume text:
${text}

Extract sections:`

        try {
            const response = await backendLLMService.generate(prompt, {
                temperature: 0.1,
                maxTokens: 2000
            })

            const sections = JSON.parse(response.text)

            if (!Array.isArray(sections)) {
                throw new Error('AI returned non-array response')
            }

            // Validate and clean sections
            return sections.map((section: any, index: number) => ({
                type: section.type || 'experience',
                content: section.content || '',
                startIndex: section.startIndex || index * 100,
                endIndex: section.endIndex || (index + 1) * 100
            }))
        } catch (error) {
            console.error('Backend AI section extraction failed:', error)
            return []
        }
    },

    async extractStructuredResume(text: string): Promise<Partial<Resume>> {
        const prompt = `Extract structured resume data from the following text. Return a JSON object with this structure:
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

Guidelines:
- Use YYYY-MM format for dates
- Extract 3-5 key achievements per job
- Group skills into logical categories (Technical Skills, Languages, etc.)
- Only include information that's clearly present in the text
- Use null for missing optional fields

Resume text:
${text}

Extract structured data:`

        try {
            const response = await backendLLMService.generate(prompt, {
                temperature: 0.1,
                maxTokens: 3000
            })

            const resume = JSON.parse(response.text)

            // Validate and clean the response
            return {
                title: resume.title || '',
                summary: resume.summary || '',
                experience: Array.isArray(resume.experience) ? resume.experience : [],
                education: Array.isArray(resume.education) ? resume.education : [],
                skills: Array.isArray(resume.skills) ? resume.skills : []
            }
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
    },

    async improveContent(content: string, improvementType: string = 'general', context?: string): Promise<{ improvedContent: string; suggestions: string[] }> {
        const prompts = {
            general: `Improve the following resume content to make it more professional and impactful:\n\n${content}`,
            summary: `Improve this professional summary to make it more compelling and specific:\n\n${content}`,
            experience: `Improve this work experience description to highlight achievements and impact:\n\n${content}`,
            skills: `Improve this skills section to be more specific and relevant:\n\n${content}`
        }

        const prompt = prompts[improvementType as keyof typeof prompts] || prompts.general

        const fullPrompt = context ? `${prompt}\n\nContext: ${context}` : prompt

        try {
            const response = await backendLLMService.generate(fullPrompt, {
                temperature: 0.7,
                maxTokens: 1000
            })

            // Generate suggestions
            const suggestionsPrompt = `Provide 3-5 specific suggestions to improve this resume content:\n\n${content}`
            const suggestionsResponse = await backendLLMService.generate(suggestionsPrompt, {
                temperature: 0.6,
                maxTokens: 500
            })

            return {
                improvedContent: response.text,
                suggestions: suggestionsResponse.text.split('\n').filter(s => s.trim())
            }
        } catch (error) {
            console.error('Backend AI content improvement failed:', error)
            return {
                improvedContent: content,
                suggestions: []
            }
        }
    },

    async getHealthStatus(): Promise<{ provider: string; can_use_real_ai: boolean; model?: string }> {
        try {
            return await backendLLMService.getHealthStatus()
        } catch (error) {
            console.error('Backend AI health check failed:', error)
            return {
                provider: 'error',
                can_use_real_ai: false
            }
        }
    }
}
