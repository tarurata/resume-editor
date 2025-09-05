'use client'

import { useState, useEffect } from 'react'
import { Resume } from '@/types/resume'
import { loadResumeFromLocalStorage } from '@/lib/storage'
import Link from 'next/link'

export default function EditorPage() {
    const [resume, setResume] = useState<Resume | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadedResume = loadResumeFromLocalStorage()
        setResume(loadedResume)
        setLoading(false)
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading resume...</p>
                </div>
            </div>
        )
    }

    if (!resume) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">No Resume Found</h1>
                    <p className="text-gray-600 mb-6">You need to create a resume first.</p>
                    <Link href="/" className="btn-primary">
                        Create Resume
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Resume Editor</h1>
                        <Link href="/" className="btn-secondary">
                            ← Back to Wizard
                        </Link>
                    </div>

                    <div className="card">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Resume</h2>

                        <div className="space-y-6">
                            {/* Title */}
                            {resume.title && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">Title</h3>
                                    <p className="text-gray-900 text-xl">{resume.title}</p>
                                </div>
                            )}

                            {/* Summary */}
                            {resume.summary && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">Summary</h3>
                                    <p className="text-gray-900">{resume.summary}</p>
                                </div>
                            )}

                            {/* Experience */}
                            {resume.experience && resume.experience.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-700 mb-4">Experience</h3>
                                    <div className="space-y-4">
                                        {resume.experience.map((exp, index) => (
                                            <div key={index} className="border-l-4 border-primary-500 pl-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 text-lg">{exp.role}</h4>
                                                        <p className="text-gray-700">{exp.organization}</p>
                                                        {exp.location && <p className="text-gray-500 text-sm">{exp.location}</p>}
                                                        <p className="text-gray-500 text-sm">
                                                            {exp.startDate} - {exp.endDate || 'Present'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {exp.bullets && exp.bullets.length > 0 && (
                                                    <ul className="mt-3 space-y-1">
                                                        {exp.bullets.map((bullet, bulletIndex) => (
                                                            <li key={bulletIndex} className="text-gray-700 flex items-start">
                                                                <span className="text-primary-500 mr-2">•</span>
                                                                {bullet}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Skills */}
                            {resume.skills && resume.skills.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-700 mb-4">Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {resume.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600 mb-4">
                            This is a preview of your resume. In a full implementation, you would have editing capabilities here.
                        </p>
                        <button
                            onClick={() => window.print()}
                            className="btn-primary"
                        >
                            Print Resume
                        </button>
                    </div>
                </div>
            </div>
        </main>
    )
}
