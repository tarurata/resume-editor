import { sanitizeResumeForApi } from '../validation'
import { Resume } from '@/types/resume'

describe('sanitizeResumeForApi', () => {
    it('should handle mixed skill types correctly', () => {
        const resume: Resume = {
            title: "Test Resume",
            summary: "Test summary",
            experience: [],
            skills: [
                "JavaScript",
                "TypeScript",
                { category: "Frontend", skills: ["React", "Vue"] },
                "Node.js",
                { category: "Backend", skills: ["Express", "FastAPI"] }
            ]
        }

        const sanitized = sanitizeResumeForApi(resume)

        // All skills should be strings
        expect(sanitized.skills.every(skill => typeof skill === 'string')).toBe(true)

        // Should extract category names from SkillCategory objects
        expect(sanitized.skills).toContain("JavaScript")
        expect(sanitized.skills).toContain("TypeScript")
        expect(sanitized.skills).toContain("Frontend")
        expect(sanitized.skills).toContain("Node.js")
        expect(sanitized.skills).toContain("Backend")

        // Should not contain the nested skills arrays
        expect(sanitized.skills).not.toContain("React")
        expect(sanitized.skills).not.toContain("Vue")
        expect(sanitized.skills).not.toContain("Express")
        expect(sanitized.skills).not.toContain("FastAPI")
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
                "TypeScript",
                { category: "", skills: [] },
                { category: "   ", skills: [] }
            ]
        }

        const sanitized = sanitizeResumeForApi(resume)
        expect(sanitized.skills).toEqual(["JavaScript", "TypeScript"])
    })
})
