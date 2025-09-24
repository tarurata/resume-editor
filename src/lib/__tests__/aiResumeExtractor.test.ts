import { AIResumeExtractor } from '../aiResumeExtractor'

// Mock the AI service
jest.mock('../llm/aiService', () => ({
    getAIService: jest.fn()
}))

describe('AIResumeExtractor', () => {
    let extractor: AIResumeExtractor
    let mockGenerate: jest.Mock

    beforeEach(() => {
        mockGenerate = jest.fn()
        const { getAIService } = require('../llm/aiService')
        getAIService.mockReturnValue({
            generate: mockGenerate
        })

        extractor = new AIResumeExtractor()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('extractPersonalInfo', () => {
        it('should extract personal information using AI', async () => {
            const mockResponse = {
                text: JSON.stringify({
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    phone: '+1234567890',
                    linkedin: 'https://linkedin.com/in/johndoe',
                    github: 'https://github.com/johndoe'
                })
            }

            mockGenerate.mockResolvedValue(mockResponse)

            const resumeText = `
        John Doe
        Software Engineer
        john.doe@example.com
        +1234567890
        https://linkedin.com/in/johndoe
        https://github.com/johndoe
      `

            const result = await extractor.extractPersonalInfo(resumeText)

            expect(result).toEqual({
                name: 'John Doe',
                email: 'john.doe@example.com',
                phone: '+1234567890',
                linkedin: 'https://linkedin.com/in/johndoe',
                github: 'https://github.com/johndoe'
            })

            expect(mockGenerate).toHaveBeenCalledWith(
                expect.stringContaining('Extract personal information'),
                expect.objectContaining({
                    temperature: 0.1,
                    maxTokens: 500
                })
            )
        })

        it('should return null when AI fails', async () => {
            mockGenerate.mockRejectedValue(new Error('AI service error'))

            const result = await extractor.extractPersonalInfo('Some text')

            expect(result).toBeNull()
        })

        it('should return null when AI returns invalid JSON', async () => {
            mockGenerate.mockResolvedValue({ text: 'invalid json' })

            const result = await extractor.extractPersonalInfo('Some text')

            expect(result).toBeNull()
        })
    })

    describe('extractResumeSections', () => {
        it('should extract resume sections using AI', async () => {
            const mockResponse = {
                text: JSON.stringify([
                    {
                        type: 'title',
                        content: 'John Doe',
                        startIndex: 0,
                        endIndex: 8
                    },
                    {
                        type: 'summary',
                        content: 'Experienced software engineer',
                        startIndex: 10,
                        endIndex: 40
                    },
                    {
                        type: 'experience',
                        content: 'Software Engineer at Tech Corp',
                        startIndex: 42,
                        endIndex: 75
                    }
                ])
            }

            mockGenerate.mockResolvedValue(mockResponse)

            const resumeText = 'John Doe\nExperienced software engineer\nSoftware Engineer at Tech Corp'

            const result = await extractor.extractResumeSections(resumeText)

            expect(result).toHaveLength(3)
            expect(result[0]).toEqual({
                type: 'title',
                content: 'John Doe',
                startIndex: 0,
                endIndex: 8
            })
        })

        it('should return empty array when AI fails', async () => {
            mockGenerate.mockRejectedValue(new Error('AI service error'))

            const result = await extractor.extractResumeSections('Some text')

            expect(result).toEqual([])
        })
    })

    describe('extractStructuredResume', () => {
        it('should extract structured resume data using AI', async () => {
            const mockResponse = {
                text: JSON.stringify({
                    title: 'John Doe',
                    summary: 'Experienced software engineer',
                    experience: [
                        {
                            role: 'Software Engineer',
                            organization: 'Tech Corp',
                            startDate: '2020-01',
                            endDate: '2023-12',
                            achievements: ['Built scalable applications', 'Led team of 5 developers']
                        }
                    ],
                    education: [
                        {
                            degree: 'Bachelor of Computer Science',
                            school: 'University of Technology',
                            graduationDate: '2019-05'
                        }
                    ],
                    skills: [
                        {
                            name: 'Technical Skills',
                            skills: ['JavaScript', 'Python', 'React']
                        }
                    ]
                })
            }

            mockGenerate.mockResolvedValue(mockResponse)

            const resumeText = 'John Doe\nExperienced software engineer...'

            const result = await extractor.extractStructuredResume(resumeText)

            expect(result.title).toBe('John Doe')
            expect(result.summary).toBe('Experienced software engineer')
            expect(result.experience).toHaveLength(1)
            expect(result.education).toHaveLength(1)
            expect(result.skills).toHaveLength(1)
        })

        it('should return empty structure when AI fails', async () => {
            mockGenerate.mockRejectedValue(new Error('AI service error'))

            const result = await extractor.extractStructuredResume('Some text')

            expect(result).toEqual({
                title: '',
                summary: '',
                experience: [],
                education: [],
                skills: []
            })
        })
    })

    describe('fallbackToRegex', () => {
        it('should use regex fallback when AI fails', () => {
            const resumeText = `
        John Doe
        john.doe@example.com
        +1234567890
        Software Engineer
      `

            const result = extractor.fallbackToRegex(resumeText)

            expect(result.personalInfo).toBeDefined()
            expect(result.sections).toBeDefined()
            expect(result.confidence).toBe(0.2)
            expect(result.errors).toContain('Using regex fallback due to AI failure')
        })
    })
})
