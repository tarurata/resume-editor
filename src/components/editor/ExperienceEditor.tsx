'use client'

import { ExperienceEntry } from '@/types/resume'
import { useState, useEffect } from 'react'

interface ExperienceEditorProps {
    experience: ExperienceEntry
    index: number
    onUpdate: (index: number, updatedExperience: ExperienceEntry) => void
}

export function ExperienceEditor({ experience, index, onUpdate }: ExperienceEditorProps) {
    const [editedExperience, setEditedExperience] = useState<ExperienceEntry>(experience)

    useEffect(() => {
        setEditedExperience(experience)
    }, [experience])

    const handleFieldChange = (field: keyof ExperienceEntry, value: string) => {
        const updated = { ...editedExperience, [field]: value }
        setEditedExperience(updated)
        onUpdate(index, updated)
    }

    const handleBulletChange = (bulletIndex: number, value: string) => {
        const updatedBullets = [...editedExperience.bullets]
        updatedBullets[bulletIndex] = value
        const updated = { ...editedExperience, bullets: updatedBullets }
        setEditedExperience(updated)
        onUpdate(index, updated)
    }

    const addBullet = () => {
        const updatedBullets = [...editedExperience.bullets, '']
        const updated = { ...editedExperience, bullets: updatedBullets }
        setEditedExperience(updated)
        onUpdate(index, updated)
    }

    const removeBullet = (bulletIndex: number) => {
        const updatedBullets = editedExperience.bullets.filter((_, i) => i !== bulletIndex)
        const updated = { ...editedExperience, bullets: updatedBullets }
        setEditedExperience(updated)
        onUpdate(index, updated)
    }

    // Generate month options
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    // Generate year options (last 20 years)
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 20 }, (_, i) => currentYear - i)

    const parseDate = (dateString: string) => {
        if (!dateString) return { month: '', year: '' }
        const [year, month] = dateString.split('-')
        return { month: month || '', year: year || '' }
    }

    const formatDate = (month: string, year: string) => {
        if (!month || !year) return ''
        const monthIndex = months.indexOf(month) + 1
        return `${year}-${monthIndex.toString().padStart(2, '0')}`
    }

    const handleStartDateChange = (month: string, year: string) => {
        const dateString = formatDate(month, year)
        handleFieldChange('startDate', dateString)
    }

    const handleEndDateChange = (month: string, year: string) => {
        const dateString = formatDate(month, year)
        handleFieldChange('endDate', dateString)
    }

    const startDate = parseDate(editedExperience.startDate)
    const endDate = parseDate(editedExperience.endDate || '')

    return (
        <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Experience {index + 1}</h3>
            </div>

            {/* Job Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title
                </label>
                <input
                    type="text"
                    value={editedExperience.role}
                    onChange={(e) => handleFieldChange('role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Senior Software Engineer"
                />
            </div>

            {/* Company Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                </label>
                <input
                    type="text"
                    value={editedExperience.organization}
                    onChange={(e) => handleFieldChange('organization', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., TechCorp Inc."
                />
            </div>

            {/* Location */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location (Optional)
                </label>
                <input
                    type="text"
                    value={editedExperience.location || ''}
                    onChange={(e) => handleFieldChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., San Francisco, CA"
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
                                <option key={year} value={year}>{year}</option>
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
                            <option value="">Present</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Bullets */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Achievements
                </label>
                <div className="space-y-2">
                    {editedExperience.bullets.map((bullet, bulletIndex) => (
                        <div key={bulletIndex} className="flex gap-2">
                            <input
                                type="text"
                                value={bullet}
                                onChange={(e) => handleBulletChange(bulletIndex, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Enter key achievement..."
                            />
                            <button
                                onClick={() => removeBullet(bulletIndex)}
                                className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={addBullet}
                        className="w-full px-3 py-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-md transition-colors border border-dashed border-primary-300"
                    >
                        + Add Achievement
                    </button>
                </div>
            </div>
        </div>
    )
}
