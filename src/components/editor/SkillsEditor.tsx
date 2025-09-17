import React, { useState } from 'react'
import { SkillSubsection } from '../../types/resume'

interface SkillsEditorProps {
    skills?: SkillSubsection[]
    onUpdate: (skills: SkillSubsection[]) => void
}

export function SkillsEditor({ skills = [], onUpdate }: SkillsEditorProps) {
    const [editingSubsection, setEditingSubsection] = useState<number | null>(null)
    const [newSubsectionName, setNewSubsectionName] = useState('')
    const [newSkills, setNewSkills] = useState<{ [key: number]: string }>({})

    const addSubsection = () => {
        if (newSubsectionName.trim()) {
            const newSubsection: SkillSubsection = {
                name: newSubsectionName.trim(),
                skills: []
            }
            onUpdate([...skills, newSubsection])
            setNewSubsectionName('')
        } else {
            // Add a subsection with a default name if no name provided
            const newSubsection: SkillSubsection = {
                name: 'New Subsection',
                skills: []
            }
            onUpdate([...skills, newSubsection])
        }
    }

    const updateSubsectionName = (index: number, name: string) => {
        const updatedSkills = [...skills]
        updatedSkills[index] = { ...updatedSkills[index], name: name.trim() }
        onUpdate(updatedSkills)
    }

    const removeSubsection = (index: number) => {
        const updatedSkills = skills.filter((_, i) => i !== index)
        onUpdate(updatedSkills)
    }

    const addSkillToSubsection = (subsectionIndex: number) => {
        const skillToAdd = newSkills[subsectionIndex]?.trim()
        if (skillToAdd) {
            const updatedSkills = [...skills]
            const subsection = updatedSkills[subsectionIndex]
            const currentSkills = subsection.skills || []
            if (!currentSkills.includes(skillToAdd)) {
                subsection.skills = [...currentSkills, skillToAdd]
                onUpdate(updatedSkills)
            }
            // Clear the input for this subsection
            setNewSkills(prev => ({ ...prev, [subsectionIndex]: '' }))
        }
    }

    const removeSkillFromSubsection = (subsectionIndex: number, skillIndex: number) => {
        const updatedSkills = [...skills]
        const subsection = updatedSkills[subsectionIndex]
        subsection.skills = (subsection.skills || []).filter((_, i) => i !== skillIndex)
        onUpdate(updatedSkills)
    }

    const updateSkillInSubsection = (subsectionIndex: number, skillIndex: number, newSkillValue: string) => {
        const updatedSkills = [...skills]
        const subsection = updatedSkills[subsectionIndex]
        if (subsection.skills && subsection.skills[skillIndex] !== undefined) {
            subsection.skills[skillIndex] = newSkillValue.trim()
            onUpdate(updatedSkills)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Skills</h3>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        placeholder="New subsection name (e.g., Programming Languages)"
                        value={newSubsectionName}
                        onChange={(e) => setNewSubsectionName(e.target.value)}
                        className="input-field flex-1 min-w-0"
                        onKeyPress={(e) => e.key === 'Enter' && addSubsection()}
                    />
                    <button
                        onClick={addSubsection}
                        className="btn-primary text-sm"
                    >
                        Add Subsection
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {skills.map((subsection, subsectionIndex) => (
                    <div key={subsectionIndex} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <input
                                type="text"
                                value={subsection.name || ''}
                                onChange={(e) => updateSubsectionName(subsectionIndex, e.target.value)}
                                className="text-lg font-medium bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                                placeholder="Subsection name"
                            />
                            <button
                                onClick={() => removeSubsection(subsectionIndex)}
                                className="text-red-500 hover:text-red-700 px-2 py-1"
                            >
                                Remove
                            </button>
                        </div>

                        <div className="space-y-2">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    placeholder="Add skill to this subsection"
                                    value={newSkills[subsectionIndex] || ''}
                                    onChange={(e) => setNewSkills(prev => ({ ...prev, [subsectionIndex]: e.target.value }))}
                                    className="input-field flex-1"
                                    onKeyPress={(e) => e.key === 'Enter' && addSkillToSubsection(subsectionIndex)}
                                />
                                <button
                                    onClick={() => addSkillToSubsection(subsectionIndex)}
                                    disabled={!newSkills[subsectionIndex]?.trim()}
                                    className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Add Skill
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {(subsection.skills || []).map((skill, skillIndex) => (
                                    <div key={skillIndex} className="flex items-center space-x-1 bg-gray-100 rounded-full px-3 py-1">
                                        <input
                                            type="text"
                                            value={skill}
                                            onChange={(e) => updateSkillInSubsection(subsectionIndex, skillIndex, e.target.value)}
                                            className="bg-transparent border-none outline-none text-sm"
                                        />
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

            {skills.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p>No skill subsections yet. Add one above to get started.</p>
                </div>
            )}
        </div>
    )
}
