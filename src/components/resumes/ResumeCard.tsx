'use client'

import React from 'react'
import Link from 'next/link'
import { ResumeListItem, formatDate, formatRelativeTime } from '@/lib/resumeService'
// Icons as inline SVG components
const PencilIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
)

const DocumentDuplicateIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
    </svg>
)

const TrashIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
)

const StarIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
)

const StarIconSolid = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
    </svg>
)

const CalendarIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5" />
    </svg>
)

const BuildingOfficeIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
)

const BriefcaseIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
    </svg>
)

interface ResumeCardProps {
    resume: ResumeListItem
    onEdit: (id: string) => void
    onDuplicate: (id: string) => void
    onDelete: (id: string) => void
    onSetActive: (id: string) => void
    isDeleting?: boolean
}

export default function ResumeCard({
    resume,
    onEdit,
    onDuplicate,
    onDelete,
    onSetActive,
    isDeleting = false
}: ResumeCardProps) {
    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault()
        onEdit(resume.id)
    }

    const handleDuplicate = (e: React.MouseEvent) => {
        e.preventDefault()
        onDuplicate(resume.id)
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault()
        onDelete(resume.id)
    }

    const handleSetActive = (e: React.MouseEvent) => {
        e.preventDefault()
        onSetActive(resume.id)
    }

    return (
        <div className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 ${isDeleting ? 'opacity-50 pointer-events-none' : ''
            }`}>
            {/* Header with active indicator */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {resume.resume_data.title}
                            </h3>
                            {resume.is_active && (
                                <StarIconSolid className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                                <BuildingOfficeIcon className="h-4 w-4" />
                                <span className="truncate">{resume.company_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <BriefcaseIcon className="h-4 w-4" />
                                <span className="truncate">{resume.job_title}</span>
                            </div>
                        </div>
                    </div>

                    {/* Active toggle button */}
                    <button
                        onClick={handleSetActive}
                        className={`p-2 rounded-full transition-colors duration-200 ${resume.is_active
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-gray-400 hover:text-yellow-500'
                            }`}
                        title={resume.is_active ? 'Active resume' : 'Set as active'}
                    >
                        <StarIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Summary preview */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {resume.resume_data.summary}
                </p>

                {/* Skills preview */}
                {resume.resume_data.skills && resume.resume_data.skills.length > 0 && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                            {resume.resume_data.skills.slice(0, 3).map((skill, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                    {typeof skill === 'string' ? skill : skill.category}
                                </span>
                            ))}
                            {resume.resume_data.skills.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                    +{resume.resume_data.skills.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Last modified */}
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                    <CalendarIcon className="h-3 w-3" />
                    <span>Modified {formatRelativeTime(resume.last_modified)}</span>
                    <span className="text-gray-300">•</span>
                    <span>{formatDate(resume.last_modified)}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleEdit}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
                        >
                            <PencilIcon className="h-4 w-4" />
                            Edit
                        </button>

                        <button
                            onClick={handleDuplicate}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
                        >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                            Duplicate
                        </button>
                    </div>

                    <button
                        onClick={handleDelete}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
                    >
                        <TrashIcon className="h-4 w-4" />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}
