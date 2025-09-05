'use client'

import { useState } from 'react'

interface JobDescriptionPanelProps {
    jdText: string
    onJdChange: (jdText: string) => void
}

export function JobDescriptionPanel({ jdText, onJdChange }: JobDescriptionPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false)

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
                        {/* Text Area */}
                        <div className="flex-1 p-4">
                            <textarea
                                value={jdText}
                                onChange={handleTextChange}
                                placeholder="Paste job description here..."
                                className="w-full h-full resize-none border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                            />
                        </div>

                        {/* Actions */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handlePaste}
                                        className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                                    >
                                        Paste from Clipboard
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

            {/* Quick Actions */}
            {jdText && (
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
