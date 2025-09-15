import { PersonalInfo } from '@/types/resume'

/**
 * Extracts personal information from resume data or text
 */
export class PersonalInfoExtractor {
    /**
     * Extract personal information from resume data
     */
    static extractFromResumeData(resumeData: any): PersonalInfo | null {
        if (!resumeData) return null

        // If personalInfo is already extracted, return it
        if (resumeData.personalInfo) {
            return resumeData.personalInfo
        }

        // Extract from resume title if it looks like a name
        const title = resumeData.title || ''
        const summary = resumeData.summary || ''

        // Try to extract name from title (common pattern: "John Doe - Software Engineer")
        const nameMatch = title.match(/^([^-]+?)(?:\s*-\s*|$)/)
        const extractedName = nameMatch ? nameMatch[1].trim() : null

        // Extract email from summary or title
        const emailMatch = (title + ' ' + summary).match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
        const extractedEmail = emailMatch ? emailMatch[0] : null

        // Extract phone number from summary
        const phoneMatch = summary.match(/(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/)
        const extractedPhone = phoneMatch ? phoneMatch[0] : null

        // Extract LinkedIn URL from summary
        const linkedinMatch = summary.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9-]+\/?/)
        const extractedLinkedin = linkedinMatch ? linkedinMatch[0] : null

        // Extract GitHub URL from summary
        const githubMatch = summary.match(/https?:\/\/(?:www\.)?github\.com\/[A-Za-z0-9-]+\/?/)
        const extractedGithub = githubMatch ? githubMatch[0] : null

        // Only return if we found at least a name or email
        if (extractedName || extractedEmail) {
            return {
                name: extractedName || undefined,
                email: extractedEmail || undefined,
                phone: extractedPhone || undefined,
                linkedin: extractedLinkedin || undefined,
                github: extractedGithub || undefined
            }
        }

        return null
    }

    /**
     * Extract personal information from raw text
     */
    static extractFromText(text: string): PersonalInfo | null {
        if (!text) return null

        // Extract name (usually first line or after "Name:", "Full Name:", etc.)
        const namePatterns = [
            /^([A-Za-z\s]+)$/m, // First line that's just letters and spaces
            /(?:name|full name):\s*([A-Za-z\s]+)/i,
            /^([A-Za-z\s]+)(?:\s*-\s*[A-Za-z\s]+)?$/m // Name followed by optional title
        ]

        let extractedName: string | null = null
        for (const pattern of namePatterns) {
            const match = text.match(pattern)
            if (match && match[1]) {
                const name = match[1].trim()
                if (name.length > 2 && name.length < 50) { // Reasonable name length
                    extractedName = name
                    break
                }
            }
        }

        // Extract email
        const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
        const extractedEmail = emailMatch ? emailMatch[0] : null

        // Extract phone number
        const phoneMatch = text.match(/(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/)
        const extractedPhone = phoneMatch ? phoneMatch[0] : null

        // Extract LinkedIn URL
        const linkedinMatch = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9-]+\/?/)
        const extractedLinkedin = linkedinMatch ? linkedinMatch[0] : null

        // Extract GitHub URL
        const githubMatch = text.match(/https?:\/\/(?:www\.)?github\.com\/[A-Za-z0-9-]+\/?/)
        const extractedGithub = githubMatch ? githubMatch[0] : null

        // Only return if we found at least a name or email
        if (extractedName || extractedEmail) {
            return {
                name: extractedName || undefined,
                email: extractedEmail || undefined,
                phone: extractedPhone || undefined,
                linkedin: extractedLinkedin || undefined,
                github: extractedGithub || undefined
            }
        }

        return null
    }

    /**
     * Remove personal information from resume data
     */
    static removeFromResumeData(resumeData: any): any {
        if (!resumeData) return resumeData

        const cleaned = { ...resumeData }
        delete cleaned.personalInfo

        // Also clean personal info from title if it looks like "Name - Title"
        if (cleaned.title) {
            const titleMatch = cleaned.title.match(/^[^-]+?-\s*(.+)$/)
            if (titleMatch) {
                cleaned.title = titleMatch[1].trim()
            }
        }

        // Clean personal info from summary
        if (cleaned.summary) {
            let summary = cleaned.summary

            // Remove email
            summary = summary.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '')

            // Remove phone
            summary = summary.replace(/(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g, '')

            // Remove LinkedIn URL
            summary = summary.replace(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9-]+\/?/g, '')

            // Remove GitHub URL
            summary = summary.replace(/https?:\/\/(?:www\.)?github\.com\/[A-Za-z0-9-]+\/?/g, '')

            // Clean up extra whitespace
            summary = summary.replace(/\s+/g, ' ').trim()

            cleaned.summary = summary
        }

        return cleaned
    }
}
