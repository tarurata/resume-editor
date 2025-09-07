'use client'

import { Resume } from '@/types/resume'
import { useEffect, useCallback } from 'react'

interface PrintViewProps {
    resume: Resume
    onClose: () => void
}

export function PrintView({ resume, onClose }: PrintViewProps) {
    const handlePrint = useCallback(() => {
        // Ensure the print dialog opens with proper settings
        setTimeout(() => {
            window.print()
        }, 100)
    }, [])

    useEffect(() => {
        // Add print-specific styles when component mounts
        const style = document.createElement('style')
        style.textContent = `
            @media print {
                body * {
                    visibility: hidden;
                }
                .print-resume, .print-resume * {
                    visibility: visible;
                }
                .print-resume {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
                .no-print {
                    display: none !important;
                }
                /* Ensure proper page breaks */
                .page-break-before {
                    page-break-before: always;
                }
                .page-break-after {
                    page-break-after: always;
                }
                .page-break-inside-avoid {
                    page-break-inside: avoid;
                    break-inside: avoid;
                }
            }
        `
        document.head.appendChild(style)

        // Add keyboard shortcut for print (Ctrl/Cmd + P)
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault()
                handlePrint()
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            if (document.head.contains(style)) {
                document.head.removeChild(style)
            }
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [handlePrint])

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Present'
        const date = new Date(dateStr + '-01')
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
        })
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 no-print">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Resume Preview</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Use "Export PDF" to save as PDF or press Ctrl/Cmd + P
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={handlePrint}
                            className="btn-primary"
                        >
                            Export PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="btn-secondary"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Print Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    <div className="print-resume max-w-4xl mx-auto">
                        {/* Title */}
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {resume.title}
                            </h1>
                        </div>

                        {/* Summary */}
                        {resume.summary && (
                            <div className="mb-6 page-break-inside-avoid">
                                <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                                    Professional Summary
                                </h2>
                                <p className="text-gray-700 leading-relaxed">
                                    {resume.summary}
                                </p>
                            </div>
                        )}

                        {/* Experience */}
                        {resume.experience && resume.experience.length > 0 && (
                            <div className="mb-6 page-break-inside-avoid">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-1">
                                    Professional Experience
                                </h2>
                                <div className="space-y-6">
                                    {resume.experience.map((exp, index) => (
                                        <div key={index} className="break-inside-avoid page-break-inside-avoid">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {exp.role}
                                                    </h3>
                                                    <p className="text-gray-700 font-medium">
                                                        {exp.organization}
                                                        {exp.location && ` • ${exp.location}`}
                                                    </p>
                                                </div>
                                                <div className="text-right text-sm text-gray-600">
                                                    <p>
                                                        {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                                                    </p>
                                                </div>
                                            </div>
                                            {exp.bullets && exp.bullets.length > 0 && (
                                                <ul className="list-disc list-inside space-y-1 text-gray-700">
                                                    {exp.bullets.map((bullet, bulletIndex) => (
                                                        <li key={bulletIndex} className="break-words">
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
                            <div className="mb-6 page-break-inside-avoid">
                                <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                                    Technical Skills
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {resume.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
