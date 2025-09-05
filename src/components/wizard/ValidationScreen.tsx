'use client'

import { useState, useEffect } from 'react'
import { WizardState, Resume } from '@/types/resume'
import { saveResumeToLocalStorage } from '@/lib/storage'

interface ValidationScreenProps {
    resume: Resume
    validationErrors: string[]
    onNext: (updates: Partial<WizardState>) => void
}

export default function ValidationScreen({ resume, validationErrors, onNext }: ValidationScreenProps) {
    const [isValid, setIsValid] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        // Check if resume meets minimum requirements
        const hasTitleOrSummary = resume.title || resume.summary
        const hasExperienceOrSkills = (resume.experience && resume.experience.length > 0) ||
            (resume.skills && resume.skills.length > 0)

        setIsValid(Boolean(hasTitleOrSummary && hasExperienceOrSkills && validationErrors.length === 0))
    }, [resume, validationErrors])

    const handleSaveAndContinue = async () => {
        if (!isValid) return

        setIsSaving(true)
        try {
            // Save to localStorage
            await saveResumeToLocalStorage(resume)

            // Navigate to editor
            window.location.href = '/editor'
        } catch (error) {
            console.error('Failed to save resume:', error)
            alert('Failed to save resume. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleEdit = () => {
        onNext({ step: 'edit' })
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Review Your Resume
                </h2>
                <p className="text-gray-600">
                    Review your resume data and make sure everything looks correct before saving.
                </p>
            </div>

            {/* Validation Status */}
            <div className={`card ${isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isValid ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                        <span className="text-white text-sm font-bold">
                            {isValid ? '✓' : '✗'}
                        </span>
                    </div>
                    <div>
                        <h3 className={`font-medium ${isValid ? 'text-green-800' : 'text-red-800'}`}>
                            {isValid ? 'Resume is valid!' : 'Resume needs attention'}
                        </h3>
                        <p className={`text-sm ${isValid ? 'text-green-700' : 'text-red-700'}`}>
                            {isValid
                                ? 'Your resume meets all requirements and is ready to save.'
                                : 'Please fix the issues below before saving.'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
                <div className="card border-red-200 bg-red-50">
                    <h3 className="text-red-800 font-medium mb-2">Issues to fix:</h3>
                    <ul className="text-red-700 text-sm space-y-1">
                        {validationErrors.map((error, index) => (
                            <li key={index}>• {error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Resume Preview */}
            <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Resume Preview</h3>

                <div className="space-y-4">
                    {/* Title */}
                    {resume.title && (
                        <div>
                            <h4 className="font-medium text-gray-700 text-sm mb-1">Title</h4>
                            <p className="text-gray-900">{resume.title}</p>
                        </div>
                    )}

                    {/* Summary */}
                    {resume.summary && (
                        <div>
                            <h4 className="font-medium text-gray-700 text-sm mb-1">Summary</h4>
                            <p className="text-gray-900">{resume.summary}</p>
                        </div>
                    )}

                    {/* Experience */}
                    {resume.experience && resume.experience.length > 0 && (
                        <div>
                            <h4 className="font-medium text-gray-700 text-sm mb-2">Experience</h4>
                            <div className="space-y-3">
                                {resume.experience.map((exp, index) => (
                                    <div key={index} className="border-l-2 border-gray-200 pl-4">
                                        <div className="font-medium text-gray-900">{exp.role}</div>
                                        <div className="text-gray-600">{exp.organization}</div>
                                        {exp.location && <div className="text-gray-500 text-sm">{exp.location}</div>}
                                        <div className="text-gray-500 text-sm">
                                            {exp.startDate} - {exp.endDate || 'Present'}
                                        </div>
                                        {exp.bullets && exp.bullets.length > 0 && (
                                            <ul className="mt-2 space-y-1">
                                                {exp.bullets.map((bullet, bulletIndex) => (
                                                    <li key={bulletIndex} className="text-gray-700 text-sm">
                                                        • {bullet}
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
                            <h4 className="font-medium text-gray-700 text-sm mb-2">Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {resume.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
                <button
                    onClick={handleEdit}
                    className="btn-secondary"
                >
                    Edit Resume
                </button>
                <button
                    onClick={handleSaveAndContinue}
                    disabled={!isValid || isSaving}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : 'Save & Continue to Editor'}
                </button>
            </div>
        </div>
    )
}
