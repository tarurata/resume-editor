'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ResumeList from '@/components/resumes/ResumeList'

export default function ResumesPage() {
    const router = useRouter()

    const handleEditResume = (id: string) => {
        // Navigate to the editor with the specific resume ID
        router.push(`/editor/${id}`)
    }

    const handleCreateResume = () => {
        // Navigate to the new resume creation page
        router.push('/resumes/new')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation */}
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                        </svg>
                        Back to Home
                    </Link>
                </div>

                <ResumeList
                    onEditResume={handleEditResume}
                    onCreateResume={handleCreateResume}
                />
            </div>
        </div>
    )
}
