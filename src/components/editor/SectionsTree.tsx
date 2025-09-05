'use client'

import { Resume } from '@/types/resume'
import { SectionId } from '@/app/editor/page'
import { useState } from 'react'

interface SectionsTreeProps {
    resume: Resume
    selectedSection: SectionId | null
    onSectionSelect: (sectionId: SectionId, content: string) => void
}

export function SectionsTree({ resume, selectedSection, onSectionSelect }: SectionsTreeProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['experience']))

    const toggleExpanded = (sectionId: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev)
            if (newSet.has(sectionId)) {
                newSet.delete(sectionId)
            } else {
                newSet.add(sectionId)
            }
            return newSet
        })
    }

    const handleSectionClick = (sectionId: SectionId, content: string) => {
        onSectionSelect(sectionId, content)
    }

    const getSectionContent = (sectionId: SectionId): string => {
        switch (sectionId) {
            case 'title':
                return resume.title || ''
            case 'summary':
                return resume.summary || ''
            case 'skills':
                return resume.skills?.join(', ') || ''
            default:
                if (sectionId.startsWith('experience-')) {
                    const index = parseInt(sectionId.split('-')[1])
                    const exp = resume.experience?.[index]
                    if (exp) {
                        return exp.bullets?.join('\n') || ''
                    }
                }
                return ''
        }
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Sections</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-2">
                    {/* Title Section */}
                    <div className="mb-2">
                        <button
                            onClick={() => handleSectionClick('title', getSectionContent('title'))}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSection === 'title'
                                    ? 'bg-primary-100 text-primary-800'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            📄 Title
                        </button>
                    </div>

                    {/* Summary Section */}
                    <div className="mb-2">
                        <button
                            onClick={() => handleSectionClick('summary', getSectionContent('summary'))}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSection === 'summary'
                                    ? 'bg-primary-100 text-primary-800'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            📝 Summary
                        </button>
                    </div>

                    {/* Experience Section */}
                    <div className="mb-2">
                        <button
                            onClick={() => toggleExpanded('experience')}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-between"
                        >
                            <span>💼 Experience</span>
                            <span className={`transform transition-transform ${expandedSections.has('experience') ? 'rotate-90' : ''}`}>
                                ▶
                            </span>
                        </button>

                        {expandedSections.has('experience') && resume.experience && resume.experience.length > 0 && (
                            <div className="ml-4 mt-1 space-y-1">
                                {resume.experience.map((exp, index) => {
                                    const sectionId = `experience-${index}` as SectionId
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleSectionClick(sectionId, getSectionContent(sectionId))}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedSection === sectionId
                                                    ? 'bg-primary-100 text-primary-800'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="truncate">
                                                <div className="font-medium">{exp.role}</div>
                                                <div className="text-xs text-gray-500">{exp.organization}</div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Skills Section */}
                    <div className="mb-2">
                        <button
                            onClick={() => handleSectionClick('skills', getSectionContent('skills'))}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSection === 'skills'
                                    ? 'bg-primary-100 text-primary-800'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            🛠️ Skills
                        </button>
                    </div>
                </div>
            </div>

            {/* Section Info */}
            {selectedSection && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="text-xs text-gray-600">
                        <div className="font-medium mb-1">Selected Section:</div>
                        <div className="truncate">
                            {selectedSection === 'title' && 'Title'}
                            {selectedSection === 'summary' && 'Summary'}
                            {selectedSection === 'skills' && 'Skills'}
                            {selectedSection.startsWith('experience-') &&
                                `Experience ${parseInt(selectedSection.split('-')[1]) + 1}`
                            }
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
