import { resumeVersionApi, ApiError } from './api'
import { Resume } from '@/types/resume'

// Extended ResumeVersion interface for the UI
export interface ResumeListItem {
    id: string
    company_name: string
    job_title: string
    last_modified: string
    is_active: boolean
    resume_data: Resume
    company_email?: string
    job_description?: string
}

// Search and filter options
export interface ResumeFilters {
    search: string
    sortBy: 'date' | 'company' | 'job_title'
    sortOrder: 'asc' | 'desc'
}

// Service class for resume operations
export class ResumeService {
    // Get all resumes with optional filtering and sorting
    static async getResumes(filters: ResumeFilters = {
        search: '',
        sortBy: 'date',
        sortOrder: 'desc'
    }): Promise<ResumeListItem[]> {
        try {
            // Try to fetch from API first
            const resumes = await resumeVersionApi.getAll()

            // Convert to ResumeListItem format
            let resumeList: ResumeListItem[] = resumes.map(resume => ({
                id: resume.id,
                company_name: resume.company_name,
                job_title: resume.job_title,
                last_modified: resume.updated_at,
                is_active: resume.is_active,
                resume_data: resume.resume_data,
                company_email: resume.company_email,
                job_description: resume.job_description
            }))

            // Apply search filter
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase()
                resumeList = resumeList.filter(resume =>
                    resume.company_name.toLowerCase().includes(searchTerm) ||
                    resume.job_title.toLowerCase().includes(searchTerm) ||
                    resume.resume_data.title.toLowerCase().includes(searchTerm)
                )
            }

            // Apply sorting
            resumeList.sort((a, b) => {
                let comparison = 0

                switch (filters.sortBy) {
                    case 'date':
                        comparison = new Date(a.last_modified).getTime() - new Date(b.last_modified).getTime()
                        break
                    case 'company':
                        comparison = a.company_name.localeCompare(b.company_name)
                        break
                    case 'job_title':
                        comparison = a.job_title.localeCompare(b.job_title)
                        break
                }

                return filters.sortOrder === 'asc' ? comparison : -comparison
            })

            return resumeList
        } catch (error) {
            console.error('Error fetching resumes from API, using mock data:', error)

            // Fallback to mock data for M1 frontend-only demo
            const mockResumes: ResumeListItem[] = [
                {
                    id: '1',
                    company_name: 'TechCorp Inc.',
                    job_title: 'Senior Software Engineer',
                    last_modified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                    is_active: true,
                    resume_data: {
                        title: 'Senior Software Engineer',
                        summary: 'Experienced software engineer with 5+ years of experience in full-stack development, specializing in React, Node.js, and cloud technologies.',
                        experience: [
                            {
                                role: 'Senior Software Engineer',
                                organization: 'TechCorp Inc.',
                                location: 'San Francisco, CA',
                                startDate: '2021-01',
                                endDate: null,
                                bullets: [
                                    'Led development of microservices architecture serving 1M+ users',
                                    'Improved application performance by 40% through code optimization',
                                    'Mentored 3 junior developers and conducted code reviews'
                                ]
                            }
                        ],
                        skills: [
                            {
                                name: 'Programming Languages',
                                skills: ['JavaScript', 'TypeScript']
                            },
                            {
                                name: 'Frameworks & Libraries',
                                skills: ['React', 'Node.js']
                            },
                            {
                                name: 'Cloud & DevOps',
                                skills: ['AWS', 'Docker']
                            }
                        ]
                    },
                    company_email: 'hr@techcorp.com',
                    job_description: 'Looking for a senior software engineer to lead our frontend team...'
                },
                {
                    id: '2',
                    company_name: 'StartupXYZ',
                    job_title: 'Full Stack Developer',
                    last_modified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
                    is_active: false,
                    resume_data: {
                        title: 'Full Stack Developer',
                        summary: 'Passionate full-stack developer with expertise in modern web technologies and agile development practices.',
                        experience: [
                            {
                                role: 'Full Stack Developer',
                                organization: 'StartupXYZ',
                                location: 'Remote',
                                startDate: '2020-06',
                                endDate: '2022-12',
                                bullets: [
                                    'Built responsive web applications using React and Node.js',
                                    'Implemented CI/CD pipelines reducing deployment time by 60%',
                                    'Collaborated with design team to create intuitive user interfaces'
                                ]
                            }
                        ],
                        skills: [
                            {
                                name: 'Frontend',
                                skills: ['React', 'Node.js']
                            },
                            {
                                name: 'Backend',
                                skills: ['Python', 'PostgreSQL']
                            },
                            {
                                name: 'Tools & Methods',
                                skills: ['Git', 'Agile']
                            }
                        ]
                    },
                    company_email: 'jobs@startupxyz.com',
                    job_description: 'Join our fast-growing startup as a full-stack developer...'
                },
                {
                    id: '3',
                    company_name: 'BigTech Corp',
                    job_title: 'Frontend Engineer',
                    last_modified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
                    is_active: false,
                    resume_data: {
                        title: 'Frontend Engineer',
                        summary: 'Frontend specialist focused on creating exceptional user experiences with modern JavaScript frameworks.',
                        experience: [
                            {
                                role: 'Frontend Engineer',
                                organization: 'BigTech Corp',
                                location: 'Seattle, WA',
                                startDate: '2019-03',
                                endDate: '2021-08',
                                bullets: [
                                    'Developed reusable component library used across 10+ products',
                                    'Optimized bundle size resulting in 30% faster page load times',
                                    'Led migration from class components to functional components with hooks'
                                ]
                            }
                        ],
                        skills: [
                            {
                                name: 'Frontend Frameworks',
                                skills: ['React', 'Vue.js', 'TypeScript']
                            },
                            {
                                name: 'Build Tools & Testing',
                                skills: ['Webpack', 'Jest']
                            },
                            {
                                name: 'Styling',
                                skills: ['CSS3', 'SASS', 'Tailwind']
                            }
                        ]
                    },
                    company_email: 'careers@bigtech.com',
                    job_description: 'We are looking for a talented frontend engineer...'
                }
            ]

            // Apply search filter to mock data
            let filteredResumes = mockResumes
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase()
                filteredResumes = mockResumes.filter(resume =>
                    resume.company_name.toLowerCase().includes(searchTerm) ||
                    resume.job_title.toLowerCase().includes(searchTerm) ||
                    resume.resume_data.title.toLowerCase().includes(searchTerm)
                )
            }

            // Apply sorting to mock data
            filteredResumes.sort((a, b) => {
                let comparison = 0

                switch (filters.sortBy) {
                    case 'date':
                        comparison = new Date(a.last_modified).getTime() - new Date(b.last_modified).getTime()
                        break
                    case 'company':
                        comparison = a.company_name.localeCompare(b.company_name)
                        break
                    case 'job_title':
                        comparison = a.job_title.localeCompare(b.job_title)
                        break
                }

                return filters.sortOrder === 'asc' ? comparison : -comparison
            })

            return filteredResumes
        }
    }

    // Get a specific resume by ID
    static async getResumeById(id: string): Promise<ResumeListItem | null> {
        try {
            const resume = await resumeVersionApi.getById(id)
            return {
                id: resume.id,
                company_name: resume.company_name,
                job_title: resume.job_title,
                last_modified: resume.updated_at,
                is_active: resume.is_active,
                resume_data: resume.resume_data,
                company_email: resume.company_email,
                job_description: resume.job_description
            }
        } catch (error) {
            if (error instanceof ApiError && error.status === 404) {
                return null
            }
            console.error('Error fetching resume from API, using mock data:', error)

            // Fallback to mock data
            const mockResumes = await this.getResumes()
            return mockResumes.find(r => r.id === id) || null
        }
    }

    // Duplicate a resume
    static async duplicateResume(id: string, newCompanyName: string, newJobTitle: string): Promise<ResumeListItem> {
        try {
            const originalResume = await resumeVersionApi.getById(id)

            // Create a new resume version with the same data but different company/job
            const duplicatedResume = await resumeVersionApi.create(
                originalResume.resume_data,
                newCompanyName,
                newJobTitle,
                originalResume.company_email,
                originalResume.job_description
            )

            return {
                id: duplicatedResume.id,
                company_name: duplicatedResume.company_name,
                job_title: duplicatedResume.job_title,
                last_modified: duplicatedResume.updated_at,
                is_active: duplicatedResume.is_active,
                resume_data: duplicatedResume.resume_data,
                company_email: duplicatedResume.company_email,
                job_description: duplicatedResume.job_description
            }
        } catch (error) {
            console.error('Error duplicating resume:', error)
            throw new Error('Failed to duplicate resume')
        }
    }

    // Delete a resume
    static async deleteResume(id: string): Promise<void> {
        try {
            await resumeVersionApi.delete(id)
        } catch (error) {
            console.error('Error deleting resume:', error)
            throw new Error('Failed to delete resume')
        }
    }

    // Set a resume as active
    static async setActiveResume(id: string): Promise<void> {
        try {
            await resumeVersionApi.setActive(id)
        } catch (error) {
            console.error('Error setting active resume:', error)
            throw new Error('Failed to set active resume')
        }
    }

    // Get active resume
    static async getActiveResume(): Promise<ResumeListItem | null> {
        try {
            const activeResume = await resumeVersionApi.getActive()
            if (!activeResume) return null

            return {
                id: activeResume.id,
                company_name: activeResume.company_name,
                job_title: activeResume.job_title,
                last_modified: activeResume.updated_at,
                is_active: activeResume.is_active,
                resume_data: activeResume.resume_data,
                company_email: activeResume.company_email,
                job_description: activeResume.job_description
            }
        } catch (error) {
            console.error('Error fetching active resume:', error)
            return null
        }
    }
}

// Utility functions for formatting
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

export const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
}
