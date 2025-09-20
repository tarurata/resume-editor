'use client'

import { useState } from 'react'
import { PrintView } from '@/components/editor/PrintView'
import { Resume } from '@/types/resume'

const sampleResume: Resume = {
    id: 'test-resume',
    title: 'Senior Software Engineer',
    summary: 'Experienced full-stack developer with 5+ years building scalable web applications using React, Node.js, and cloud technologies. Passionate about clean code, user experience, and mentoring junior developers.',
    personalInfo: {
        name: 'John Doe',
        title: 'Senior Software Engineer',
        email: 'john.doe@example.com',
        phone: '555-123-4567',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe'
    },
    experience: [
        {
            role: 'Senior Software Engineer',
            organization: 'TechCorp Inc.',
            location: 'San Francisco, CA',
            startDate: '2021-03',
            endDate: null,
            bullets: [
                'Led development of microservices architecture serving 1M+ daily active users',
                'Improved application performance by 40% through code optimization and caching strategies',
                'Mentored 3 junior developers and established code review best practices',
                'Implemented CI/CD pipelines reducing deployment time from 2 hours to 15 minutes'
            ]
        },
        {
            role: 'Software Engineer',
            organization: 'StartupXYZ',
            location: 'Remote',
            startDate: '2019-06',
            endDate: '2021-02',
            bullets: [
                'Built responsive React applications with TypeScript and Redux',
                'Developed RESTful APIs using Node.js and Express',
                'Collaborated with design team to implement pixel-perfect UI components',
                'Participated in agile development process with 2-week sprints'
            ]
        }
    ],
    education: [
        {
            degree: 'Bachelor of Computer Science',
            school: 'University of Technology',
            location: 'San Francisco, CA',
            startDate: '2014-09',
            endDate: '2018-05'
        }
    ],
    certifications: [
        {
            name: 'AWS Certified Developer',
            issuer: 'Amazon Web Services',
            date: '2022-06'
        },
        {
            name: 'Google Cloud Professional Developer',
            issuer: 'Google Cloud',
            date: '2021-12'
        }
    ],
    skills: [
        {
            name: 'Languages',
            skills: ['JavaScript', 'TypeScript', 'Python', 'Java']
        },
        {
            name: 'Frameworks',
            skills: ['React', 'Node.js', 'Express', 'Django']
        },
        {
            name: 'Cloud & Tools',
            skills: ['AWS', 'Docker', 'Git', 'PostgreSQL']
        }
    ]
}

export default function TestPage() {
    const [showPrintView, setShowPrintView] = useState(false)

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">PDF Export Test Page</h1>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Resume Data</h2>
                    <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Name:</strong> {sampleResume.personalInfo?.name}</p>
                        <p><strong>Title:</strong> {sampleResume.title}</p>
                        <p><strong>Email:</strong> {sampleResume.personalInfo?.email}</p>
                        <p><strong>Phone:</strong> {sampleResume.personalInfo?.phone}</p>
                        <p><strong>Experience Entries:</strong> {sampleResume.experience?.length || 0}</p>
                        <p><strong>Education Entries:</strong> {sampleResume.education?.length || 0}</p>
                        <p><strong>Certifications:</strong> {sampleResume.certifications?.length || 0}</p>
                        <p><strong>Skill Categories:</strong> {sampleResume.skills?.length || 0}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">PDF Export Options</h2>
                    <p className="text-gray-600 mb-6">
                        Test the different PDF export methods to ensure they work correctly with the LaTeX-style formatting.
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={() => setShowPrintView(true)}
                            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Open Print View (LaTeX Style)
                        </button>

                        <div className="text-sm text-gray-500">
                            <p><strong>Features to test:</strong></p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>LaTeX-style typography and layout</li>
                                <li>Proper date formatting (e.g., "Mar 2021 -- Present")</li>
                                <li>Section headers with underlines</li>
                                <li>Experience bullets with proper indentation</li>
                                <li>Contact information formatting</li>
                                <li>Skills categorization</li>
                                <li>Browser PDF export functionality</li>
                                <li>Print preview functionality</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {showPrintView && (
                <PrintView
                    resume={sampleResume}
                    onClose={() => setShowPrintView(false)}
                />
            )}
        </div>
    )
}
