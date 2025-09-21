'use client'

import { useState, useEffect } from 'react'
import { WizardState, Resume, ExperienceEntry, EducationEntry, CertificationEntry, ParsedSection } from '@/types/resume'
import { createAIResumeExtractor } from '@/lib/aiResumeExtractorBackend'

interface SectionEditorProps {
    parsedSections: ParsedSection[]
    resume: Partial<Resume>
    pastedText?: string
    onNext: (updates: Partial<WizardState>) => void
}

export default function SectionEditor({ parsedSections, resume, pastedText, onNext }: SectionEditorProps) {
    const [editedResume, setEditedResume] = useState<Partial<Resume>>({
        title: '',
        summary: '',
        experience: [],
        skills: [],
        ...resume
    })

    const [validationErrors, setValidationErrors] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [aiExtractionResult, setAiExtractionResult] = useState<any>(null)

    useEffect(() => {
        const extractStructuredData = async () => {
            if (parsedSections.length === 0) return

            setIsLoading(true)

            try {
                // Use the full pasted text for AI analysis if available, otherwise combine sections
                const textForAnalysis = pastedText || parsedSections.map(s => s.content).join('\n\n')

                // Use AI to extract structured resume data
                const aiExtractor = createAIResumeExtractor()
                const structuredData = await aiExtractor.extractStructuredResume(textForAnalysis)

                console.log('AI extracted structured data:', structuredData)
                console.log('Experience data:', structuredData.experience)
                if (structuredData.experience && structuredData.experience.length > 0) {
                    console.log('First experience from AI:', structuredData.experience[0])
                    console.log('First experience achievements:', structuredData.experience[0].achievements)
                }
                setAiExtractionResult(structuredData)

                // Merge AI extraction with existing resume data
                const newResume: Partial<Resume> = {
                    title: structuredData.title || resume.title || '',
                    summary: structuredData.summary || resume.summary || '',
                    experience: structuredData.experience || resume.experience || [],
                    education: structuredData.education || resume.education || [],
                    skills: structuredData.skills || resume.skills || [],
                    ...resume
                }

                console.log('Final resume data before setting state:', newResume)
                console.log('Final experience data:', newResume.experience)
                setEditedResume(newResume)
            } catch (error) {
                console.error('AI structured extraction failed, using basic parsing:', error)

                // Fallback to basic section parsing
                const newResume: Partial<Resume> = {
                    title: '',
                    summary: '',
                    experience: [],
                    skills: [],
                    ...resume
                }

                // Extract data from parsed sections (fallback method)
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
                                achievements: ['Add your achievements here']
                            })
                            break
                        case 'skills':
                            // Parse skills from text and create a default subsection
                            const skills = section.content.split(',').map(s => s.trim()).filter(s => s.length > 0)
                            if (skills.length > 0) {
                                newResume.skills = [{
                                    name: 'Technical Skills',
                                    skills: skills
                                }]
                            }
                            break
                        case 'education':
                            // Create a basic education entry
                            if (!newResume.education) newResume.education = []
                            newResume.education.push({
                                degree: section.content,
                                school: 'University Name',
                                startDate: '2018-09',
                                endDate: '2022-05'
                            })
                            break
                        case 'certifications':
                            // Create a basic certification entry
                            if (!newResume.certifications) newResume.certifications = []
                            newResume.certifications.push({
                                name: section.content,
                                issuer: 'Issuing Organization',
                                date: '2023-01'
                            })
                            break
                    }
                })

                setEditedResume(newResume)
            } finally {
                setIsLoading(false)
            }
        }

        extractStructuredData()
    }, [parsedSections, resume, pastedText])

    const addExperience = () => {
        const newExperience: ExperienceEntry = {
            role: 'Job Title',
            organization: 'Company Name',
            startDate: '2020-01',
            endDate: null,
            achievements: ['Add your achievements here']
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

    const addAchievement = (expIndex: number) => {
        updateExperience(expIndex, 'achievements', [
            ...(editedResume.experience?.[expIndex]?.achievements || []),
            'New achievement'
        ])
    }

    const updateAchievement = (expIndex: number, achievementIndex: number, value: string) => {
        const newAchievements = [...(editedResume.experience?.[expIndex]?.achievements || [])]
        newAchievements[achievementIndex] = value
        updateExperience(expIndex, 'achievements', newAchievements)
    }

    const removeAchievement = (expIndex: number, achievementIndex: number) => {
        const newAchievements = editedResume.experience?.[expIndex]?.achievements?.filter((_, i) => i !== achievementIndex) || []
        updateExperience(expIndex, 'achievements', newAchievements)
    }

    const addSkill = () => {
        setEditedResume(prev => ({
            ...prev,
            skills: [...(prev.skills || []), { name: 'New Subsection', skills: [] }]
        }))
    }

    const updateSkillSubsectionName = (subsectionIndex: number, name: string) => {
        setEditedResume(prev => ({
            ...prev,
            skills: prev.skills?.map((subsection, i) =>
                i === subsectionIndex ? { ...subsection, name } : subsection
            ) || []
        }))
    }

    const removeSkillSubsection = (subsectionIndex: number) => {
        setEditedResume(prev => ({
            ...prev,
            skills: prev.skills?.filter((_, i) => i !== subsectionIndex) || []
        }))
    }

    const addSkillToSubsection = (subsectionIndex: number, skill: string) => {
        if (skill.trim()) {
            setEditedResume(prev => ({
                ...prev,
                skills: prev.skills?.map((subsection, i) =>
                    i === subsectionIndex
                        ? { ...subsection, skills: [...subsection.skills, skill.trim()] }
                        : subsection
                ) || []
            }))
        }
    }

    const removeSkillFromSubsection = (subsectionIndex: number, skillIndex: number) => {
        setEditedResume(prev => ({
            ...prev,
            skills: prev.skills?.map((subsection, i) =>
                i === subsectionIndex
                    ? { ...subsection, skills: subsection.skills.filter((_, j) => j !== skillIndex) }
                    : subsection
            ) || []
        }))
    }

    // Education handlers
    const addEducation = () => {
        const newEducation: EducationEntry = {
            degree: 'Degree Name',
            school: 'University Name',
            startDate: '2018-09',
            endDate: '2022-05'
        }
        setEditedResume(prev => ({
            ...prev,
            education: [...(prev.education || []), newEducation]
        }))
    }

    const updateEducation = (index: number, field: keyof EducationEntry, value: any) => {
        setEditedResume(prev => ({
            ...prev,
            education: prev.education?.map((edu, i) =>
                i === index ? { ...edu, [field]: value } : edu
            ) || []
        }))
    }

    const removeEducation = (index: number) => {
        setEditedResume(prev => ({
            ...prev,
            education: prev.education?.filter((_, i) => i !== index) || []
        }))
    }

    const moveEducation = (index: number, direction: 'up' | 'down') => {
        const newEducation = [...(editedResume.education || [])]
        const newIndex = direction === 'up' ? index - 1 : index + 1

        if (newIndex >= 0 && newIndex < newEducation.length) {
            [newEducation[index], newEducation[newIndex]] = [newEducation[newIndex], newEducation[index]]
            setEditedResume(prev => ({
                ...prev,
                education: newEducation
            }))
        }
    }

    // Certification handlers
    const addCertification = () => {
        const newCertification: CertificationEntry = {
            name: 'Certification Name',
            issuer: 'Issuing Organization',
            date: '2023-01'
        }
        setEditedResume(prev => ({
            ...prev,
            certifications: [...(prev.certifications || []), newCertification]
        }))
    }

    const updateCertification = (index: number, field: keyof CertificationEntry, value: any) => {
        setEditedResume(prev => ({
            ...prev,
            certifications: prev.certifications?.map((cert, i) =>
                i === index ? { ...cert, [field]: value } : cert
            ) || []
        }))
    }

    const removeCertification = (index: number) => {
        setEditedResume(prev => ({
            ...prev,
            certifications: prev.certifications?.filter((_, i) => i !== index) || []
        }))
    }

    const moveCertification = (index: number, direction: 'up' | 'down') => {
        const newCertifications = [...(editedResume.certifications || [])]
        const newIndex = direction === 'up' ? index - 1 : index + 1

        if (newIndex >= 0 && newIndex < newCertifications.length) {
            [newCertifications[index], newCertifications[newIndex]] = [newCertifications[newIndex], newCertifications[index]]
            setEditedResume(prev => ({
                ...prev,
                certifications: newCertifications
            }))
        }
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
            console.log('SectionEditor - Sending resume to validation:', editedResume)
            console.log('SectionEditor - Experience data being sent:', editedResume.experience)
            if (editedResume.experience && editedResume.experience.length > 0) {
                console.log('SectionEditor - First experience achievements:', editedResume.experience[0].achievements)
            }

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
                                            onClick={() => addAchievement(index)}
                                            className="text-sm text-primary-600 hover:text-primary-700"
                                        >
                                            + Add Achievement
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {exp.achievements.map((achievement, achievementIndex) => (
                                            <div key={achievementIndex} className="flex space-x-2">
                                                <input
                                                    type="text"
                                                    value={achievement}
                                                    onChange={(e) => updateAchievement(index, achievementIndex, e.target.value)}
                                                    className="input-field flex-1"
                                                />
                                                <button
                                                    onClick={() => removeAchievement(index, achievementIndex)}
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

                {/* Education */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Education</h3>
                        <button
                            onClick={addEducation}
                            className="btn-primary text-sm"
                        >
                            Add Education
                        </button>
                    </div>

                    <div className="space-y-4">
                        {editedResume.education?.map((edu, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-medium text-gray-900">Education #{index + 1}</h4>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => moveEducation(index, 'up')}
                                            disabled={index === 0}
                                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            onClick={() => moveEducation(index, 'down')}
                                            disabled={index === (editedResume.education?.length || 0) - 1}
                                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            onClick={() => removeEducation(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                                        <input
                                            type="text"
                                            value={edu.degree}
                                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                                        <input
                                            type="text"
                                            value={edu.school}
                                            onChange={(e) => updateEducation(index, 'school', e.target.value)}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                        <input
                                            type="text"
                                            value={edu.location || ''}
                                            onChange={(e) => updateEducation(index, 'location', e.target.value)}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (YYYY-MM)</label>
                                        <input
                                            type="text"
                                            value={edu.startDate}
                                            onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date (YYYY-MM or leave empty for current)</label>
                                        <input
                                            type="text"
                                            value={edu.endDate || ''}
                                            onChange={(e) => updateEducation(index, 'endDate', e.target.value || null)}
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Certifications */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Certifications</h3>
                        <button
                            onClick={addCertification}
                            className="btn-primary text-sm"
                        >
                            Add Certification
                        </button>
                    </div>

                    <div className="space-y-4">
                        {editedResume.certifications?.map((cert, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-medium text-gray-900">Certification #{index + 1}</h4>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => moveCertification(index, 'up')}
                                            disabled={index === 0}
                                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            onClick={() => moveCertification(index, 'down')}
                                            disabled={index === (editedResume.certifications?.length || 0) - 1}
                                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            onClick={() => removeCertification(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name</label>
                                        <input
                                            type="text"
                                            value={cert.name}
                                            onChange={(e) => updateCertification(index, 'name', e.target.value)}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Issuer</label>
                                        <input
                                            type="text"
                                            value={cert.issuer}
                                            onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date (YYYY-MM)</label>
                                        <input
                                            type="text"
                                            value={cert.date}
                                            onChange={(e) => updateCertification(index, 'date', e.target.value)}
                                            className="input-field"
                                        />
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
                            Add Subsection
                        </button>
                    </div>

                    <div className="space-y-4">
                        {editedResume.skills?.map((subsection, subsectionIndex) => (
                            <div key={subsectionIndex} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <input
                                        type="text"
                                        value={subsection.name}
                                        onChange={(e) => updateSkillSubsectionName(subsectionIndex, e.target.value)}
                                        className="text-lg font-medium bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                                        placeholder="Subsection name"
                                    />
                                    <button
                                        onClick={() => removeSkillSubsection(subsectionIndex)}
                                        className="text-red-500 hover:text-red-700 px-2"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            placeholder="Add skill to this subsection"
                                            className="input-field flex-1"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    addSkillToSubsection(subsectionIndex, e.currentTarget.value)
                                                    e.currentTarget.value = ''
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={(e) => {
                                                const input = e.currentTarget.previousElementSibling as HTMLInputElement
                                                addSkillToSubsection(subsectionIndex, input.value)
                                                input.value = ''
                                            }}
                                            className="btn-secondary text-sm"
                                        >
                                            Add Skill
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {subsection.skills.map((skill, skillIndex) => (
                                            <div key={skillIndex} className="flex items-center space-x-1 bg-gray-100 rounded-full px-3 py-1">
                                                <span className="text-sm">{skill}</span>
                                                <button
                                                    onClick={() => removeSkillFromSubsection(subsectionIndex, skillIndex)}
                                                    className="text-red-500 hover:text-red-700 text-sm"
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
            </div>

            <div className="flex justify-between">
                <button
                    onClick={() => onNext({ step: 'parse', pastedText })}
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
