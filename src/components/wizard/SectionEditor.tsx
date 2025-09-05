'use client'

import { useState, useEffect } from 'react'
import { WizardState, Resume, ExperienceEntry, ParsedSection } from '@/types/resume'

interface SectionEditorProps {
    parsedSections: ParsedSection[]
    resume: Partial<Resume>
    onNext: (updates: Partial<WizardState>) => void
}

export default function SectionEditor({ parsedSections, resume, onNext }: SectionEditorProps) {
    const [editedResume, setEditedResume] = useState<Partial<Resume>>({
        title: '',
        summary: '',
        experience: [],
        skills: [],
        ...resume
    })

    const [validationErrors, setValidationErrors] = useState<string[]>([])

    useEffect(() => {
        // Initialize resume from parsed sections
        const newResume: Partial<Resume> = {
            title: '',
            summary: '',
            experience: [],
            skills: [],
            ...resume
        }

        // Extract data from parsed sections
        parsedSections.forEach(section => {
            switch (section.type) {
                case 'title':
                    newResume.title = section.content
                    break
                case 'summary':
                    newResume.summary = section.content
                    break
                case 'experience':
                    // Create a basic experience entry
                    if (!newResume.experience) newResume.experience = []
                    newResume.experience.push({
                        role: section.content,
                        organization: 'Company Name',
                        startDate: '2020-01',
                        endDate: null,
                        bullets: ['Add your achievements here']
                    })
                    break
                case 'skills':
                    // Parse skills from text (comma-separated)
                    const skills = section.content.split(',').map(s => s.trim()).filter(s => s.length > 0)
                    newResume.skills = skills
                    break
            }
        })

        setEditedResume(newResume)
    }, [parsedSections, resume])

    const addExperience = () => {
        const newExperience: ExperienceEntry = {
            role: 'Job Title',
            organization: 'Company Name',
            startDate: '2020-01',
            endDate: null,
            bullets: ['Add your achievements here']
        }
        setEditedResume(prev => ({
            ...prev,
            experience: [...(prev.experience || []), newExperience]
        }))
    }

    const updateExperience = (index: number, field: keyof ExperienceEntry, value: any) => {
        setEditedResume(prev => ({
            ...prev,
            experience: prev.experience?.map((exp, i) =>
                i === index ? { ...exp, [field]: value } : exp
            ) || []
        }))
    }

    const removeExperience = (index: number) => {
        setEditedResume(prev => ({
            ...prev,
            experience: prev.experience?.filter((_, i) => i !== index) || []
        }))
    }

    const moveExperience = (index: number, direction: 'up' | 'down') => {
        const newExperience = [...(editedResume.experience || [])]
        const newIndex = direction === 'up' ? index - 1 : index + 1

        if (newIndex >= 0 && newIndex < newExperience.length) {
            [newExperience[index], newExperience[newIndex]] = [newExperience[newIndex], newExperience[index]]
            setEditedResume(prev => ({
                ...prev,
                experience: newExperience
            }))
        }
    }

    const addBullet = (expIndex: number) => {
        updateExperience(expIndex, 'bullets', [
            ...(editedResume.experience?.[expIndex]?.bullets || []),
            'New achievement'
        ])
    }

    const updateBullet = (expIndex: number, bulletIndex: number, value: string) => {
        const newBullets = [...(editedResume.experience?.[expIndex]?.bullets || [])]
        newBullets[bulletIndex] = value
        updateExperience(expIndex, 'bullets', newBullets)
    }

    const removeBullet = (expIndex: number, bulletIndex: number) => {
        const newBullets = editedResume.experience?.[expIndex]?.bullets?.filter((_, i) => i !== bulletIndex) || []
        updateExperience(expIndex, 'bullets', newBullets)
    }

    const addSkill = () => {
        setEditedResume(prev => ({
            ...prev,
            skills: [...(prev.skills || []), 'New skill']
        }))
    }

    const updateSkill = (index: number, value: string) => {
        setEditedResume(prev => ({
            ...prev,
            skills: prev.skills?.map((skill, i) => i === index ? value : skill) || []
        }))
    }

    const removeSkill = (index: number) => {
        setEditedResume(prev => ({
            ...prev,
            skills: prev.skills?.filter((_, i) => i !== index) || []
        }))
    }

    const validateResume = (): string[] => {
        const errors: string[] = []

        if (!editedResume.title && !editedResume.summary) {
            errors.push('Resume must have either a title or summary')
        }

        if (!editedResume.experience?.length && !editedResume.skills?.length) {
            errors.push('Resume must have at least one experience entry or skills')
        }

        return errors
    }

    const handleContinue = () => {
        const errors = validateResume()
        setValidationErrors(errors)

        if (errors.length === 0) {
            onNext({
                step: 'validate',
                resume: editedResume,
                validationErrors: []
            })
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Edit Resume Sections
                </h2>
                <p className="text-gray-600">
                    Review and edit your resume sections. Add, remove, or reorder content as needed.
                </p>
            </div>

            {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-red-800 font-medium mb-2">Please fix the following issues:</h3>
                    <ul className="text-red-700 text-sm space-y-1">
                        {validationErrors.map((error, index) => (
                            <li key={index}>• {error}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="grid gap-6">
                {/* Title */}
                <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Title</h3>
                    <input
                        type="text"
                        value={editedResume.title || ''}
                        onChange={(e) => setEditedResume(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter your professional title"
                        className="input-field"
                    />
                </div>

                {/* Summary */}
                <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
                    <textarea
                        value={editedResume.summary || ''}
                        onChange={(e) => setEditedResume(prev => ({ ...prev, summary: e.target.value }))}
                        placeholder="Enter your professional summary"
                        className="input-field h-24 resize-none"
                    />
                </div>

                {/* Experience */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Experience</h3>
                        <button
                            onClick={addExperience}
                            className="btn-primary text-sm"
                        >
                            Add Experience
                        </button>
                    </div>

                    <div className="space-y-4">
                        {editedResume.experience?.map((exp, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-medium text-gray-900">Experience #{index + 1}</h4>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => moveExperience(index, 'up')}
                                            disabled={index === 0}
                                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            onClick={() => moveExperience(index, 'down')}
                                            disabled={index === (editedResume.experience?.length || 0) - 1}
                                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            onClick={() => removeExperience(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <input
                                            type="text"
                                            value={exp.role}
                                            onChange={(e) => updateExperience(index, 'role', e.target.value)}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                                        <input
                                            type="text"
                                            value={exp.organization}
                                            onChange={(e) => updateExperience(index, 'organization', e.target.value)}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                        <input
                                            type="text"
                                            value={exp.location || ''}
                                            onChange={(e) => updateExperience(index, 'location', e.target.value)}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (YYYY-MM)</label>
                                        <input
                                            type="text"
                                            value={exp.startDate}
                                            onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date (YYYY-MM or leave empty for current)</label>
                                        <input
                                            type="text"
                                            value={exp.endDate || ''}
                                            onChange={(e) => updateExperience(index, 'endDate', e.target.value || null)}
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-700">Achievements</label>
                                        <button
                                            onClick={() => addBullet(index)}
                                            className="text-sm text-primary-600 hover:text-primary-700"
                                        >
                                            + Add Achievement
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {exp.bullets.map((bullet, bulletIndex) => (
                                            <div key={bulletIndex} className="flex space-x-2">
                                                <input
                                                    type="text"
                                                    value={bullet}
                                                    onChange={(e) => updateBullet(index, bulletIndex, e.target.value)}
                                                    className="input-field flex-1"
                                                />
                                                <button
                                                    onClick={() => removeBullet(index, bulletIndex)}
                                                    className="text-red-500 hover:text-red-700 px-2"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skills */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Skills</h3>
                        <button
                            onClick={addSkill}
                            className="btn-primary text-sm"
                        >
                            Add Skill
                        </button>
                    </div>

                    <div className="space-y-2">
                        {editedResume.skills?.map((skill, index) => (
                            <div key={index} className="flex space-x-2">
                                <input
                                    type="text"
                                    value={skill}
                                    onChange={(e) => updateSkill(index, e.target.value)}
                                    className="input-field flex-1"
                                />
                                <button
                                    onClick={() => removeSkill(index)}
                                    className="text-red-500 hover:text-red-700 px-2"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-between">
                <button
                    onClick={() => onNext({ step: 'parse' })}
                    className="btn-secondary"
                >
                    Back
                </button>
                <button
                    onClick={handleContinue}
                    className="btn-primary"
                >
                    Continue to Validation
                </button>
            </div>
        </div>
    )
}
