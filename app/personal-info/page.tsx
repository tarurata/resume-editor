'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PersonalInfoDisplay from '@/components/personal-info/PersonalInfoDisplay'
import PersonalInfoEditor from '@/components/personal-info/PersonalInfoEditor'
import { PersonalInfo } from '@/types/resume'
import withAuth from '@/lib/withAuth' // Import withAuth HOC

function PersonalInfoPage() { // Change to a regular function component
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null)

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleSave = (updatedPersonalInfo: PersonalInfo) => {
        setPersonalInfo(updatedPersonalInfo)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setIsEditing(false)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Personal Information</h1>
                            <p className="text-gray-600 mt-2">
                                Manage your personal information that will be used across all your resumes.
                            </p>
                        </div>
                        <button
                            onClick={() => router.back()}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {isEditing ? (
                        <PersonalInfoEditor
                            onSave={handleSave}
                            onCancel={handleCancel}
                            initialData={personalInfo}
                        />
                    ) : (
                        <PersonalInfoDisplay
                            onEdit={handleEdit}
                            showEditButton={true}
                        />
                    )}

                    {/* Information about personal info */}
                    <div className="card bg-blue-50 border-blue-200">
                        <div className="flex items-start space-x-3">
                            <div className="w-5 h-5 text-blue-600 mt-0.5">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            </div>
                            <div>
                                <h3 className="text-blue-900 font-medium mb-1">About Personal Information</h3>
                                <div className="text-blue-800 text-sm space-y-1">
                                    <p>• Your personal information is stored separately from your resume data</p>
                                    <p>• This information can be used across all your resume versions</p>
                                    <p>• You can update it anytime without affecting your existing resumes</p>
                                    <p>• Personal information is automatically extracted when you import resume text</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default withAuth(PersonalInfoPage)
