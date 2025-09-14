'use client'

import { useState, useEffect } from 'react'
import { SectionId } from '@/types/resume'
import { getSectionDisplayName, getAvailableSections } from '@/lib/urlUtils'
import { ChevronLeftIcon, ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'

interface SectionNavigationProps {
    resume: any
    currentSection: SectionId | null
    onSectionChange: (sectionId: SectionId) => void
    className?: string
}

export function SectionNavigation({
    resume,
    currentSection,
    onSectionChange,
    className = ''
}: SectionNavigationProps) {
    const [availableSections, setAvailableSections] = useState<SectionId[]>([])
    const [currentIndex, setCurrentIndex] = useState(-1)

    useEffect(() => {
        const sections = getAvailableSections(resume)
        setAvailableSections(sections)

        const index = currentSection ? sections.indexOf(currentSection) : -1
        setCurrentIndex(index)
    }, [resume, currentSection])

    const handlePrevious = () => {
        if (currentIndex > 0) {
            const prevSection = availableSections[currentIndex - 1]
            onSectionChange(prevSection)
        }
    }

    const handleNext = () => {
        if (currentIndex < availableSections.length - 1) {
            const nextSection = availableSections[currentIndex + 1]
            onSectionChange(nextSection)
        }
    }

    const handleSectionSelect = (sectionId: SectionId) => {
        onSectionChange(sectionId)
    }

    const handleHome = () => {
        // Navigate to first section or clear selection
        if (availableSections.length > 0) {
            onSectionChange(availableSections[0])
        }
    }

    if (availableSections.length === 0) {
        return null
    }

    return (
        <div className={`bg-white border-b border-gray-200 px-4 py-3 ${className}`}>
            <div className="flex items-center justify-between">
                {/* Navigation Controls */}
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleHome}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="Go to first section"
                    >
                        <HomeIcon className="h-4 w-4" />
                    </button>

                    <button
                        onClick={handlePrevious}
                        disabled={currentIndex <= 0}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Previous section"
                    >
                        <ChevronLeftIcon className="h-4 w-4" />
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={currentIndex >= availableSections.length - 1}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Next section"
                    >
                        <ChevronRightIcon className="h-4 w-4" />
                    </button>
                </div>

                {/* Section Selector */}
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Section:</span>
                    <select
                        value={currentSection || ''}
                        onChange={(e) => handleSectionSelect(e.target.value as SectionId)}
                        className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        <option value="">Select a section</option>
                        {availableSections.map((sectionId) => (
                            <option key={sectionId} value={sectionId}>
                                {getSectionDisplayName(sectionId)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Section Counter */}
                <div className="text-sm text-gray-500">
                    {currentIndex >= 0 ? `${currentIndex + 1} of ${availableSections.length}` : 'No section selected'}
                </div>
            </div>

            {/* Section Breadcrumb */}
            {currentSection && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-500">Current:</span>
                        <span className="font-medium text-gray-900">
                            {getSectionDisplayName(currentSection)}
                        </span>
                        {currentSection.startsWith('experience-') && (
                            <span className="text-gray-400">
                                ({resume.experience?.[parseInt(currentSection.split('-')[1])]?.organization || 'Unknown Company'})
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

/**
 * Compact section navigation for mobile or smaller spaces
 */
export function CompactSectionNavigation({
    resume,
    currentSection,
    onSectionChange,
    className = ''
}: SectionNavigationProps) {
    const [availableSections, setAvailableSections] = useState<SectionId[]>([])
    const [currentIndex, setCurrentIndex] = useState(-1)

    useEffect(() => {
        const sections = getAvailableSections(resume)
        setAvailableSections(sections)

        const index = currentSection ? sections.indexOf(currentSection) : -1
        setCurrentIndex(index)
    }, [resume, currentSection])

    const handlePrevious = () => {
        if (currentIndex > 0) {
            const prevSection = availableSections[currentIndex - 1]
            onSectionChange(prevSection)
        }
    }

    const handleNext = () => {
        if (currentIndex < availableSections.length - 1) {
            const nextSection = availableSections[currentIndex + 1]
            onSectionChange(nextSection)
        }
    }

    if (availableSections.length === 0) {
        return null
    }

    return (
        <div className={`flex items-center justify-between bg-gray-50 px-3 py-2 ${className}`}>
            <button
                onClick={handlePrevious}
                disabled={currentIndex <= 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous section"
            >
                <ChevronLeftIcon className="h-4 w-4" />
            </button>

            <div className="flex-1 text-center">
                <span className="text-sm font-medium text-gray-900">
                    {currentSection ? getSectionDisplayName(currentSection) : 'No section selected'}
                </span>
                <div className="text-xs text-gray-500">
                    {currentIndex >= 0 ? `${currentIndex + 1} of ${availableSections.length}` : ''}
                </div>
            </div>

            <button
                onClick={handleNext}
                disabled={currentIndex >= availableSections.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next section"
            >
                <ChevronRightIcon className="h-4 w-4" />
            </button>
        </div>
    )
}
