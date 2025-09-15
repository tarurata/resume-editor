'use client'

import { EducationEntry } from '@/types/resume'
import { useState, useEffect } from 'react'

interface EducationEditorProps {
    education: EducationEntry
    index: number
    onUpdate: (index: number, updatedEducation: EducationEntry) => void
}

export function EducationEditor({ education, index, onUpdate }: EducationEditorProps) {
    const [editedEducation, setEditedEducation] = useState<EducationEntry>(education)

    useEffect(() => {
        setEditedEducation(education)
    }, [education])

    const handleFieldChange = (field: keyof EducationEntry, value: string) => {
        const updated = { ...editedEducation, [field]: value }
        setEditedEducation(updated)
        onUpdate(index, updated)
    }

    // Generate month options
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    // Generate year options (last 30 years)
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

    const parseDate = (dateString: string) => {
        if (!dateString) return { month: '', year: '' }
        const [year, month] = dateString.split('-')

        // Handle partial dates
        if (month && !isNaN(parseInt(month))) {
            // Full date or year-month format
            const monthIndex = parseInt(month) - 1
            const monthName = monthIndex >= 0 && monthIndex < months.length ? months[monthIndex] : ''
            return { month: monthName, year: year || '' }
        } else if (month && isNaN(parseInt(month))) {
            // Partial date with month name like "2024-January"
            const monthIndex = months.indexOf(month)
            const monthNumber = monthIndex >= 0 ? (monthIndex + 1).toString().padStart(2, '0') : ''
            return { month: month, year: year || '' }
        } else {
            // Just year or empty
            return { month: '', year: year || '' }
        }
    }

    const formatDate = (month: string, year: string) => {
        if (!month || !year) return ''
        const monthIndex = months.indexOf(month) + 1
        if (monthIndex === 0) return '' // Invalid month
        return `${year}-${monthIndex.toString().padStart(2, '0')}`
    }

    const handleStartDateChange = (month: string, year: string) => {
        // If both month and year are present, format as YYYY-MM
        if (month && year) {
            const dateString = formatDate(month, year)
            handleFieldChange('startDate', dateString)
        } else if (month || year) {
            // If only one is present, store as partial date for now
            const partialDate = `${year}-${month}`
            handleFieldChange('startDate', partialDate)
        } else {
            // Both empty, clear the field
            handleFieldChange('startDate', '')
        }
    }

    const handleEndDateChange = (month: string, year: string) => {
        // If both month and year are present, format as YYYY-MM
        if (month && year) {
            const dateString = formatDate(month, year)
            handleFieldChange('endDate', dateString)
        } else if (month || year) {
            // If only one is present, store as partial date for now
            const partialDate = `${year}-${month}`
            handleFieldChange('endDate', partialDate)
        } else {
            // Both empty, clear the field
            handleFieldChange('endDate', '')
        }
    }

    const startDate = parseDate(editedEducation.startDate || '')
    const endDate = parseDate(editedEducation.endDate || '')

    return (
        <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Education {index + 1}</h3>
            </div>

            {/* Degree */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Degree
                </label>
                <input
                    type="text"
                    value={editedEducation.degree}
                    onChange={(e) => handleFieldChange('degree', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Bachelor of Science in Computer Science"
                />
            </div>

            {/* School Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    School Name
                </label>
                <input
                    type="text"
                    value={editedEducation.school}
                    onChange={(e) => handleFieldChange('school', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., University of California, Berkeley"
                />
            </div>

            {/* Location */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location (Optional)
                </label>
                <input
                    type="text"
                    value={editedEducation.location || ''}
                    onChange={(e) => handleFieldChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Berkeley, CA"
                />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <select
                            value={startDate.month}
                            onChange={(e) => handleStartDateChange(e.target.value, startDate.year)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">Month</option>
                            {months.map(month => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                        <select
                            value={startDate.year}
                            onChange={(e) => handleStartDateChange(startDate.month, e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">Year</option>
                            {years.map(year => (
                                <option key={year} value={year.toString()}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <select
                            value={endDate.month}
                            onChange={(e) => handleEndDateChange(e.target.value, endDate.year)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">Month</option>
                            {months.map(month => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                        <select
                            value={endDate.year}
                            onChange={(e) => handleEndDateChange(endDate.month, e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">Year</option>
                            {years.map(year => (
                                <option key={year} value={year.toString()}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )
}
