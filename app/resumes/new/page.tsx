'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ResumeService } from '@/lib/resumeService'
import { Resume } from '@/types/resume'
import { syncExperiencesToDatabase } from '@/lib/experiencesApi'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import withAuth from '@/lib/withAuth'

function NewResumePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        companyName: '',
        jobTitle: '',
        companyEmail: '',
        jobDescription: ''
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleCreateFromTemplate = async (template: Resume) => {
        if (!formData.companyName.trim() || !formData.jobTitle.trim()) {
            setError('Company name and job title are required')
            return
        }

        setLoading(true)
        setError(null)

        try {
            // Create a new resume with the template data
            const { saveResumeToDatabase } = await import('@/lib/storage')
            const savedResume = await saveResumeToDatabase(
                template,
                formData.companyName,
                formData.jobTitle,
                undefined, // companyEmail
                undefined, // companyUrl
                undefined, // jobDescription
                null // Don't extract personal info from template data
            )

            // Get the newly created resume to get its ID
            const resumes = await ResumeService.getResumes()
            const newResume = resumes.find(r =>
                r.company_name === formData.companyName &&
                r.job_title === formData.jobTitle
            )

            if (newResume) {
                // Sync experiences and achievements to database tables
                if (template.experience && template.experience.length > 0) {
                    console.log('Syncing template experiences and achievements to database...')
                    try {
                        await syncExperiencesToDatabase(
                            newResume.id, // resume version ID
                            template.experience
                        )
                        console.log('Template experiences and achievements synced successfully')
                    } catch (syncError) {
                        console.error('Failed to sync template experiences to database:', syncError)
                        // Don't fail the entire process if experiences sync fails
                    }
                }

                router.push(`/editor/${newResume.id}`)
            } else {
                // Fallback to the old editor if we can't find the new resume
                router.push('/editor')
            }
        } catch (err) {
            console.error('Failed to create resume:', err)
            setError('Failed to create resume. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateBlank = async () => {
        if (!formData.companyName.trim() || !formData.jobTitle.trim()) {
            setError('Company name and job title are required')
            return
        }

        setLoading(true)
        setError(null)

        try {
            // Create a blank resume
            const blankResume: Resume = {
                title: formData.jobTitle,
                summary: '',
                experience: [],
                skills: []
            }

            const { saveResumeToDatabase } = await import('@/lib/storage')
            await saveResumeToDatabase(
                blankResume,
                formData.companyName,
                formData.jobTitle,
                undefined, // companyEmail
                undefined, // companyUrl
                undefined, // jobDescription
                null // Don't extract personal info from blank resume
            )

            // Get the newly created resume to get its ID
            const resumes = await ResumeService.getResumes()
            const newResume = resumes.find(r =>
                r.company_name === formData.companyName &&
                r.job_title === formData.jobTitle
            )

            if (newResume) {
                router.push(`/editor/${newResume.id}`)
            } else {
                // Fallback to the old editor if we can't find the new resume
                router.push('/editor')
            }
        } catch (err) {
            console.error('Failed to create resume:', err)
            setError('Failed to create resume. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const templates = [
        {
            id: 'software-engineer',
            name: 'Software Engineer',
            description: 'Template for software engineering positions',
            data: {
                title: 'Software Engineer',
                summary: 'Experienced software engineer with expertise in full-stack development, cloud technologies, and agile methodologies. Passionate about building scalable applications and mentoring junior developers.',
                experience: [
                    {
                        role: 'Software Engineer',
                        organization: 'Your Company',
                        location: 'City, State',
                        startDate: '2020-01',
                        endDate: null,
                        achievements: [
                            'Developed and maintained web applications using modern technologies',
                            'Collaborated with cross-functional teams to deliver high-quality software',
                            'Implemented CI/CD pipelines and automated testing processes',
                            'Mentored junior developers and conducted code reviews'
                        ]
                    }
                ],
                skills: [
                    {
                        name: 'Programming Languages',
                        skills: ['JavaScript', 'TypeScript', 'Python', 'Java']
                    },
                    {
                        name: 'Frameworks & Libraries',
                        skills: ['React', 'Node.js', 'Express', 'Next.js']
                    },
                    {
                        name: 'Cloud & DevOps',
                        skills: ['AWS', 'Docker', 'Git', 'CI/CD']
                    },
                    {
                        name: 'Soft Skills',
                        skills: ['Agile/Scrum', 'Problem Solving', 'Team Leadership', 'Mentoring']
                    }
                ]
            } as Resume
        },
        {
            id: 'data-scientist',
            name: 'Data Scientist',
            description: 'Template for data science and analytics positions',
            data: {
                title: 'Data Scientist',
                summary: 'Data scientist with strong analytical skills and experience in machine learning, statistical analysis, and data visualization. Proven track record of driving business insights through data.',
                experience: [
                    {
                        role: 'Data Scientist',
                        organization: 'Your Company',
                        location: 'City, State',
                        startDate: '2020-01',
                        endDate: null,
                        achievements: [
                            'Developed machine learning models to solve business problems',
                            'Analyzed large datasets to identify trends and patterns',
                            'Created data visualizations and dashboards for stakeholders',
                            'Collaborated with engineering teams to deploy models in production'
                        ]
                    }
                ],
                skills: [
                    {
                        name: 'Programming Languages',
                        skills: ['Python', 'R', 'SQL']
                    },
                    {
                        name: 'Machine Learning',
                        skills: ['TensorFlow', 'Scikit-learn', 'Pandas', 'NumPy']
                    },
                    {
                        name: 'Data Visualization',
                        skills: ['Tableau', 'Jupyter', 'Matplotlib', 'Seaborn']
                    },
                    {
                        name: 'Tools & Platforms',
                        skills: ['AWS', 'Docker', 'Git', 'Jupyter Notebooks']
                    }
                ]
            } as Resume
        },
        {
            id: 'product-manager',
            name: 'Product Manager',
            description: 'Template for product management positions',
            data: {
                title: 'Product Manager',
                summary: 'Strategic product manager with experience in product development, market analysis, and cross-functional team leadership. Focused on delivering user-centric solutions that drive business growth.',
                experience: [
                    {
                        role: 'Product Manager',
                        organization: 'Your Company',
                        location: 'City, State',
                        startDate: '2020-01',
                        endDate: null,
                        achievements: [
                            'Led product strategy and roadmap development',
                            'Conducted market research and competitive analysis',
                            'Collaborated with engineering and design teams',
                            'Managed product launches and feature rollouts'
                        ]
                    }
                ],
                skills: [
                    {
                        name: 'Product Management',
                        skills: ['Product Strategy', 'Roadmap Planning', 'Feature Prioritization']
                    },
                    {
                        name: 'Methodologies',
                        skills: ['Agile/Scrum', 'User Research', 'A/B Testing']
                    },
                    {
                        name: 'Technical Skills',
                        skills: ['Data Analysis', 'SQL', 'Figma', 'Jira']
                    },
                    {
                        name: 'Leadership',
                        skills: ['Project Management', 'Stakeholder Management', 'Team Leadership']
                    }
                ]
            } as Resume
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation */}
                <div className="mb-6">
                    <Breadcrumbs
                        items={[
                            { label: 'Resumes', href: '/resumes' },
                            { label: 'Create New Resume', href: '/resumes/new' }
                        ]}
                    />
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Resume</h1>
                    <p className="text-gray-600">Choose a template or start with a blank resume</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    {error}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Resume Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                                Company Name *
                            </label>
                            <input
                                type="text"
                                id="companyName"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., TechCorp Inc."
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                                Job Title *
                            </label>
                            <input
                                type="text"
                                id="jobTitle"
                                name="jobTitle"
                                value={formData.jobTitle}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., Senior Software Engineer"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                Company Email (Optional)
                            </label>
                            <input
                                type="email"
                                id="companyEmail"
                                name="companyEmail"
                                value={formData.companyEmail}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., hr@techcorp.com"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                Job Description (Optional)
                            </label>
                            <textarea
                                id="jobDescription"
                                name="jobDescription"
                                value={formData.jobDescription}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Paste the job description here to help customize your resume..."
                            />
                        </div>
                    </div>
                </div>

                {/* Templates */}
                <div className="mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Choose a Template</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map((template) => (
                            <div key={template.id} className="bg-white rounded-lg shadow p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                                <h3 className="font-medium text-gray-900 mb-2">{template.name}</h3>
                                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                                <button
                                    onClick={() => handleCreateFromTemplate(template.data)}
                                    disabled={loading}
                                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Creating...' : 'Use Template'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Blank Resume Option */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-2">Start from Scratch</h2>
                    <p className="text-gray-600 mb-4">Create a blank resume and build it from the ground up</p>
                    <button
                        onClick={handleCreateBlank}
                        disabled={loading}
                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating...' : 'Create Blank Resume'}
                    </button>
                </div>
            </div>
        </div>
    )
}
export default withAuth(NewResumePage)
