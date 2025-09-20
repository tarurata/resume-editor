import { sanitizeResumeForApi } from '../validation'
import { Resume } from '@/types/resume'

describe('sanitizeResumeForApi', () => {
    it('should handle string skills correctly', () => {
        const resume: Resume = {
            title: "Test Resume",
            summary: "Test summary",
            experience: [],
            skills: [
                "JavaScript",
                "TypeScript",
                "React",
                "Node.js",
                "Express"
            ]
        }

        const sanitized = sanitizeResumeForApi(resume)

        // All skills should be strings
        expect(sanitized.skills.every(skill => typeof skill === 'string')).toBe(true)

        // Should contain all the skills
        expect(sanitized.skills).toContain("JavaScript")
        expect(sanitized.skills).toContain("TypeScript")
        expect(sanitized.skills).toContain("React")
        expect(sanitized.skills).toContain("Node.js")
        expect(sanitized.skills).toContain("Express")
    })

    it('should handle empty skills array', () => {
        const resume: Resume = {
            title: "Test Resume",
            summary: "Test summary",
            experience: [],
            skills: []
        }

        const sanitized = sanitizeResumeForApi(resume)
        expect(sanitized.skills).toEqual([])
    })

    it('should filter out empty skills', () => {
        const resume: Resume = {
            title: "Test Resume",
            summary: "Test summary",
            experience: [],
            skills: [
                "JavaScript",
                "",
                "   ",
                "TypeScript"
            ]
        }

        const sanitized = sanitizeResumeForApi(resume)
        expect(sanitized.skills).toEqual(["JavaScript", "TypeScript"])
    })
})
