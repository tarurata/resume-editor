'use client'

import { useState } from 'react'
import { JobDescriptionExtraction } from '@/types/resume'
import { aiApiService } from '@/lib/aiApi'

interface JobDescriptionPanelProps {
    jdText: string
    onJdChange: (jdText: string) => void
    onExtractionComplete?: (extraction: JobDescriptionExtraction) => void
    companyName?: string
    onCompanyNameChange?: (companyName: string) => void
    companyEmail?: string
    onCompanyEmailChange?: (companyEmail: string) => void
    companyUrl?: string
    onCompanyUrlChange?: (companyUrl: string) => void
    onJobTitleChange?: (jobTitle: string) => void
}

export function JobDescriptionPanel({
    jdText,
    onJdChange,
    onExtractionComplete,
    companyName = '',
    onCompanyNameChange,
    companyEmail = '',
    onCompanyEmailChange,
    companyUrl = '',
    onCompanyUrlChange,
    onJobTitleChange
}: JobDescriptionPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isExtracting, setIsExtracting] = useState(false)
    const [extraction, setExtraction] = useState<JobDescriptionExtraction | null>(null)
    const [extractionError, setExtractionError] = useState<string | null>(null)
    const [autoExtract, setAutoExtract] = useState(true)

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onJdChange(e.target.value)
    }

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText()
            onJdChange(text)
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err)
        }
    }

    const clearText = () => {
        onJdChange('')
        setExtraction(null)
        setExtractionError(null)
    }

    const handleExtract = async () => {
        if (!jdText.trim()) {
            setExtractionError('Please enter a job description first')
            return
        }

        setIsExtracting(true)
        setExtractionError(null)

        try {
            const response = await aiApiService.extractJobDescription(jdText)

            if (response.success && response.data) {
                setExtraction(response.data)
                onExtractionComplete?.(response.data)

                // Auto-extract company name, company email, company URL, and job title if enabled
                if (autoExtract && response.data) {
                    if (response.data.company_name && onCompanyNameChange) {
                        onCompanyNameChange(response.data.company_name)
                    }
                    if (response.data.company_email && onCompanyEmailChange) {
                        onCompanyEmailChange(response.data.company_email)
                    }
                    if (response.data.company_url && onCompanyUrlChange) {
                        onCompanyUrlChange(response.data.company_url)
                    }
                    if (response.data.job_title && onJobTitleChange) {
                        onJobTitleChange(response.data.job_title)
                    }
                }
            } else {
                setExtractionError(response.errors?.[0] || 'Extraction failed')
            }
        } catch (error) {
            setExtractionError(error instanceof Error ? error.message : 'Extraction failed')
        } finally {
            setIsExtracting(false)
        }
    }

    const wordCount = jdText.trim().split(/\s+/).filter(word => word.length > 0).length
    const characterCount = jdText.length

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Job Description</h2>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 rounded hover:bg-gray-100"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                        {isExpanded ? '−' : '+'}
                    </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                    Paste job description to get AI-powered suggestions
                </p>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col">
                {!isExpanded ? (
                    // Collapsed view
                    <div className="p-4">
                        <div className="text-center text-gray-500">
                            <div className="text-4xl mb-2">📋</div>
                            <p className="text-sm">
                                {jdText ? `${wordCount} words pasted` : 'No job description'}
                            </p>
                            {jdText && (
                                <button
                                    onClick={() => setIsExpanded(true)}
                                    className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                                >
                                    View & Edit
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    // Expanded view
                    <div className="flex-1 flex flex-col">
                        {/* Company Name Input */}
                        <div className="p-4 border-b border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company Name
                            </label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => onCompanyNameChange?.(e.target.value)}
                                placeholder="Enter company name..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                            />
                        </div>

                        {/* Company Email Input */}
                        <div className="p-4 border-b border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company Email
                            </label>
                            <input
                                type="email"
                                value={companyEmail}
                                onChange={(e) => onCompanyEmailChange?.(e.target.value)}
                                placeholder="Enter company email (e.g., careers@company.com)..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                            />
                        </div>

                        {/* Company URL Input */}
                        <div className="p-4 border-b border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company URL
                            </label>
                            <input
                                type="url"
                                value={companyUrl}
                                onChange={(e) => onCompanyUrlChange?.(e.target.value)}
                                placeholder="Enter company URL (e.g., https://company.com/careers)..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                            />
                        </div>

                        {/* Text Area */}
                        <div className="flex-1 p-4">
                            <textarea
                                value={jdText}
                                onChange={handleTextChange}
                                placeholder="Paste job description here..."
                                rows={10}
                                className="w-full resize-none border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                            />
                        </div>

                        {/* Actions */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                            {/* Auto-extract checkbox */}
                            <div className="mb-3">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={autoExtract}
                                        onChange={(e) => setAutoExtract(e.target.checked)}
                                        className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Automatically Add Company Name, Email, URL, and Job Title from extracted data
                                    </span>
                                </label>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handlePaste}
                                        className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                                    >
                                        Paste from Clipboard
                                    </button>
                                    <button
                                        onClick={handleExtract}
                                        disabled={isExtracting || !jdText.trim()}
                                        className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isExtracting ? 'Extracting...' : 'Extract Info'}
                                    </button>
                                    <button
                                        onClick={clearText}
                                        className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center justify-between text-xs text-gray-600">
                                <div className="flex space-x-4">
                                    <span>{wordCount} words</span>
                                    <span>{characterCount} characters</span>
                                </div>
                                <div className="text-right">
                                    {jdText.length > 0 && (
                                        <span className="text-green-600">
                                            ✓ Ready for analysis
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Extracted Information */}
            {extraction && (
                <div className="p-4 border-t border-gray-200 bg-green-50">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-green-800">Extracted Information</h3>
                        <span className="text-xs text-green-600">✓ AI Analysis Complete</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {/* Company & Job Title */}
                        <div className="space-y-2">
                            {extraction.company_name && (
                                <div>
                                    <span className="font-medium text-gray-700">Company:</span>
                                    <span className="ml-2 text-gray-900">{extraction.company_name}</span>
                                </div>
                            )}
                            {extraction.company_email && (
                                <div>
                                    <span className="font-medium text-gray-700">Company Email:</span>
                                    <span className="ml-2 text-gray-900">{extraction.company_email}</span>
                                </div>
                            )}
                            {extraction.company_url && (
                                <div>
                                    <span className="font-medium text-gray-700">Company URL:</span>
                                    <a
                                        href={extraction.company_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 text-blue-600 hover:text-blue-800 underline"
                                    >
                                        {extraction.company_url}
                                    </a>
                                </div>
                            )}
                            {extraction.job_title && (
                                <div>
                                    <span className="font-medium text-gray-700">Job Title:</span>
                                    <span className="ml-2 text-gray-900">{extraction.job_title}</span>
                                </div>
                            )}
                            {extraction.location && (
                                <div>
                                    <span className="font-medium text-gray-700">Location:</span>
                                    <span className="ml-2 text-gray-900">{extraction.location}</span>
                                </div>
                            )}
                            {extraction.compensation && (
                                <div>
                                    <span className="font-medium text-gray-700">Compensation:</span>
                                    <span className="ml-2 text-gray-900">{extraction.compensation}</span>
                                </div>
                            )}
                        </div>

                        {/* Skills */}
                        <div className="space-y-2">
                            {extraction.required_skills && extraction.required_skills.length > 0 && (
                                <div>
                                    <span className="font-medium text-gray-700">Required Skills:</span>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {extraction.required_skills.map((skill, index) => (
                                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {extraction.preferred_skills && extraction.preferred_skills.length > 0 && (
                                <div>
                                    <span className="font-medium text-gray-700">Preferred Skills:</span>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {extraction.preferred_skills.map((skill, index) => (
                                            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Info */}
                    {(extraction.experience_level || extraction.employment_type || extraction.remote_work) && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                            <div className="flex flex-wrap gap-4 text-xs">
                                {extraction.experience_level && (
                                    <span className="text-gray-600">
                                        <span className="font-medium">Level:</span> {extraction.experience_level}
                                    </span>
                                )}
                                {extraction.employment_type && (
                                    <span className="text-gray-600">
                                        <span className="font-medium">Type:</span> {extraction.employment_type}
                                    </span>
                                )}
                                {extraction.remote_work && (
                                    <span className="text-gray-600">
                                        <span className="font-medium">Remote:</span> {extraction.remote_work}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Error Display */}
            {extractionError && (
                <div className="p-4 border-t border-gray-200 bg-red-50">
                    <div className="text-sm text-red-800">
                        <span className="font-medium">Error:</span> {extractionError}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            {jdText && !extraction && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="text-xs text-gray-600 mb-2">Quick Actions:</div>
                    <div className="space-y-1">
                        <div className="text-xs text-gray-500">
                            • Extract title from JD
                        </div>
                        <div className="text-xs text-gray-500">
                            • Rewrite summary to match JD
                        </div>
                        <div className="text-xs text-gray-500">
                            • Quantify experience bullets
                        </div>
                        <div className="text-xs text-gray-500">
                            • Map skills to JD requirements
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
