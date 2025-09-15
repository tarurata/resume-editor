'use client'

import { useState, useEffect } from 'react'
import { PersonalInfo } from '@/types/resume'
import { personalInfoApi, ApiError } from '@/lib/api'

interface PersonalInfoDisplayProps {
    onEdit?: () => void
    showEditButton?: boolean
}

export default function PersonalInfoDisplay({ onEdit, showEditButton = true }: PersonalInfoDisplayProps) {
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadPersonalInfo()
    }, [])

    const loadPersonalInfo = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const existingInfo = await personalInfoApi.get()
            if (existingInfo) {
                setPersonalInfo({
                    name: existingInfo.full_name || '',
                    email: existingInfo.email || '',
                    phone: existingInfo.phone || '',
                    linkedin: existingInfo.linkedin_url || '',
                    github: existingInfo.portfolio_url || ''
                })
            }
        } catch (error) {
            if (error instanceof ApiError && error.status === 404) {
                // No personal info exists yet
                setPersonalInfo(null)
            } else {
                console.error('Failed to load personal information:', error)
                setError('Failed to load personal information')
            }
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="card">
                <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    <span className="ml-2 text-gray-600 text-sm">Loading...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="card">
                <div className="text-center py-4">
                    <p className="text-red-600 text-sm">{error}</p>
                    <button
                        onClick={loadPersonalInfo}
                        className="mt-2 text-primary-600 hover:text-primary-700 text-sm"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    if (!personalInfo) {
        return (
            <div className="card">
                <div className="text-center py-6">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Personal Information</h3>
                    <p className="text-gray-600 text-sm mb-4">
                        You haven't added your personal information yet. This will be used across all your resumes.
                    </p>
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="btn-primary"
                        >
                            Add Personal Information
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="card">
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                {showEditButton && onEdit && (
                    <button
                        onClick={onEdit}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                        Edit
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {personalInfo.name && (
                    <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 text-gray-400">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <span className="text-gray-900">{personalInfo.name}</span>
                    </div>
                )}

                {personalInfo.email && (
                    <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 text-gray-400">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <a
                            href={`mailto:${personalInfo.email}`}
                            className="text-primary-600 hover:text-primary-700"
                        >
                            {personalInfo.email}
                        </a>
                    </div>
                )}

                {personalInfo.phone && (
                    <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 text-gray-400">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>
                        <a
                            href={`tel:${personalInfo.phone}`}
                            className="text-primary-600 hover:text-primary-700"
                        >
                            {personalInfo.phone}
                        </a>
                    </div>
                )}

                {personalInfo.linkedin && (
                    <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 text-gray-400">
                            <svg fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </div>
                        <a
                            href={personalInfo.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700"
                        >
                            LinkedIn Profile
                        </a>
                    </div>
                )}

                {personalInfo.github && (
                    <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 text-gray-400">
                            <svg fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                        </div>
                        <a
                            href={personalInfo.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700"
                        >
                            GitHub Profile
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}
