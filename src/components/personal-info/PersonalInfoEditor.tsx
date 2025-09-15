'use client'

import { useState, useEffect } from 'react'
import { PersonalInfo } from '@/types/resume'
import { personalInfoApi, ApiError } from '@/lib/api'

interface PersonalInfoEditorProps {
    onSave?: (personalInfo: PersonalInfo) => void
    onCancel?: () => void
    initialData?: PersonalInfo | null
}

export default function PersonalInfoEditor({ onSave, onCancel, initialData }: PersonalInfoEditorProps) {
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
        name: '',
        email: '',
        phone: '',
        linkedin: '',
        github: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (initialData) {
            setPersonalInfo(initialData)
        } else {
            // Load existing personal info
            loadPersonalInfo()
        }
    }, [initialData])

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
                // No personal info exists yet, that's fine
                console.log('No existing personal information found')
            } else {
                console.error('Failed to load personal information:', error)
                setError('Failed to load personal information')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (field: keyof PersonalInfo, value: string) => {
        setPersonalInfo(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        setError(null)

        try {
            // Validate required fields
            if (!personalInfo.name?.trim() || !personalInfo.email?.trim()) {
                setError('Name and email are required')
                return
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(personalInfo.email!)) {
                setError('Please enter a valid email address')
                return
            }

            // Check if personal info already exists
            const existingInfo = await personalInfoApi.get()

            if (existingInfo) {
                // Update existing personal info
                await personalInfoApi.update({
                    full_name: personalInfo.name!,
                    email: personalInfo.email!,
                    phone: personalInfo.phone || undefined,
                    location: undefined, // Not in our PersonalInfo interface
                    linkedin_url: personalInfo.linkedin || undefined,
                    portfolio_url: personalInfo.github || undefined
                })
            } else {
                // Create new personal info
                await personalInfoApi.create({
                    full_name: personalInfo.name!,
                    email: personalInfo.email!,
                    phone: personalInfo.phone || undefined,
                    location: undefined,
                    linkedin_url: personalInfo.linkedin || undefined,
                    portfolio_url: personalInfo.github || undefined
                })
            }

            onSave?.(personalInfo)
        } catch (error) {
            console.error('Failed to save personal information:', error)
            setError(error instanceof Error ? error.message : 'Failed to save personal information')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="card">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <span className="ml-2 text-gray-600">Loading personal information...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="card">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Personal Information</h2>
                <p className="text-gray-600">
                    This information will be used across all your resumes. You can update it anytime.
                </p>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            <div className="space-y-4">
                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={personalInfo.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="input-field"
                        placeholder="Enter your full name"
                        required
                    />
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={personalInfo.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="input-field"
                        placeholder="Enter your email address"
                        required
                    />
                </div>

                {/* Phone */}
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        value={personalInfo.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="input-field"
                        placeholder="Enter your phone number"
                    />
                </div>

                {/* LinkedIn */}
                <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                        LinkedIn Profile
                    </label>
                    <input
                        type="url"
                        id="linkedin"
                        value={personalInfo.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                        className="input-field"
                        placeholder="https://linkedin.com/in/yourprofile"
                    />
                </div>

                {/* GitHub */}
                <div>
                    <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-1">
                        GitHub Profile
                    </label>
                    <input
                        type="url"
                        id="github"
                        value={personalInfo.github}
                        onChange={(e) => handleInputChange('github', e.target.value)}
                        className="input-field"
                        placeholder="https://github.com/yourusername"
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="btn-secondary"
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                )}
                <button
                    onClick={handleSave}
                    disabled={isSaving || !personalInfo.name?.trim() || !personalInfo.email?.trim()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : 'Save Personal Information'}
                </button>
            </div>
        </div>
    )
}
