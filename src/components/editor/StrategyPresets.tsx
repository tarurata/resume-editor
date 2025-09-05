'use client'

import { SectionId } from '@/app/editor/page'
import { useState } from 'react'

interface StrategyPresetsProps {
    sectionId: SectionId
    jdText: string
    currentContent: string
    onContentChange: (content: string) => void
}

interface Preset {
    id: string
    name: string
    description: string
    icon: string
}

const presets: Record<string, Preset[]> = {
    title: [
        {
            id: 'extract-from-jd',
            name: 'Extract from JD',
            description: 'Extract job title from job description',
            icon: '🎯'
        }
    ],
    summary: [
        {
            id: 'rewrite-short',
            name: 'Rewrite (≤50 words)',
            description: 'Rewrite summary to be concise and impactful',
            icon: '✂️'
        },
        {
            id: 'rewrite-medium',
            name: 'Rewrite (≤100 words)',
            description: 'Rewrite summary with more detail',
            icon: '📝'
        },
        {
            id: 'match-jd',
            name: 'Match JD Tone',
            description: 'Rewrite to match job description language',
            icon: '🎭'
        }
    ],
    experience: [
        {
            id: 'quantify',
            name: 'Quantify & Mirror',
            description: 'Add metrics and mirror JD language',
            icon: '📊'
        },
        {
            id: 'action-verbs',
            name: 'Strong Action Verbs',
            description: 'Replace weak verbs with impactful ones',
            icon: '⚡'
        },
        {
            id: 'achievements',
            name: 'Focus on Achievements',
            description: 'Emphasize results and accomplishments',
            icon: '🏆'
        }
    ],
    skills: [
        {
            id: 'map-jd',
            name: 'Map to JD',
            description: 'Filter and prioritize skills from JD',
            icon: '🗺️'
        },
        {
            id: 'categorize',
            name: 'Categorize',
            description: 'Group skills by category',
            icon: '📂'
        },
        {
            id: 'prioritize',
            name: 'Prioritize',
            description: 'Order by relevance and importance',
            icon: '⭐'
        }
    ]
}

export function StrategyPresets({ sectionId, jdText, currentContent, onContentChange }: StrategyPresetsProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [lastGenerated, setLastGenerated] = useState<string | null>(null)

    const getSectionType = (sectionId: SectionId): string => {
        if (sectionId === 'title' || sectionId === 'summary' || sectionId === 'skills') {
            return sectionId
        }
        if (sectionId.startsWith('experience-')) {
            return 'experience'
        }
        return 'unknown'
    }

    const sectionType = getSectionType(sectionId)
    const availablePresets = presets[sectionType] || []

    const generateSuggestion = async (presetId: string) => {
        if (!jdText.trim()) {
            alert('Please paste a job description first to generate suggestions.')
            return
        }

        setIsGenerating(true)

        try {
            // Mock API call - in real implementation this would call MSW mock
            const response = await fetch('/api/edit/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sectionId,
                    presetId,
                    currentContent,
                    jdText
                })
            })

            if (!response.ok) {
                throw new Error('Failed to generate suggestion')
            }

            const data = await response.json()
            setLastGenerated(data.suggestion)
            onContentChange(data.suggestion)
        } catch (error) {
            console.error('Error generating suggestion:', error)
            // Fallback to mock data for development
            const mockSuggestion = generateMockSuggestion(sectionType, presetId, currentContent, jdText)
            setLastGenerated(mockSuggestion)
            onContentChange(mockSuggestion)
        } finally {
            setIsGenerating(false)
        }
    }

    const generateMockSuggestion = (sectionType: string, presetId: string, currentContent: string, jdText: string): string => {
        // Mock suggestions based on section type and preset
        switch (sectionType) {
            case 'title':
                return 'Senior Software Engineer' // Mock extracted title
            case 'summary':
                if (presetId === 'rewrite-short') {
                    return 'Experienced full-stack developer with 5+ years building scalable applications. Expert in React, Node.js, and cloud technologies. Passionate about clean code and user experience.'
                } else if (presetId === 'match-jd') {
                    return 'Results-driven software engineer with expertise in full-stack development, cloud technologies, and agile methodologies. Proven track record of delivering scalable solutions and leading cross-functional teams.'
                }
                return currentContent
            case 'experience':
                if (presetId === 'quantify') {
                    return '• Led development of microservices architecture serving 1M+ daily active users\n• Improved application performance by 40% through code optimization\n• Mentored 3 junior developers and established best practices\n• Implemented CI/CD pipelines reducing deployment time by 87%'
                } else if (presetId === 'action-verbs') {
                    return '• Architected and developed microservices serving 1M+ users\n• Optimized application performance by 40%\n• Mentored 3 junior developers and established best practices\n• Streamlined CI/CD pipelines reducing deployment time by 87%'
                }
                return currentContent
            case 'skills':
                if (presetId === 'map-jd') {
                    return 'JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, PostgreSQL, MongoDB, Git, Agile/Scrum, RESTful APIs'
                } else if (presetId === 'categorize') {
                    return 'Frontend: JavaScript, TypeScript, React\nBackend: Node.js, Python, RESTful APIs\nCloud: AWS, Docker\nDatabase: PostgreSQL, MongoDB\nTools: Git, Agile/Scrum'
                }
                return currentContent
            default:
                return currentContent
        }
    }

    const revertToOriginal = () => {
        if (lastGenerated) {
            onContentChange(currentContent)
            setLastGenerated(null)
        }
    }

    if (availablePresets.length === 0) {
        return null
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Strategy Presets</h3>
                {lastGenerated && (
                    <button
                        onClick={revertToOriginal}
                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                        Revert to original
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-2">
                {availablePresets.map((preset) => (
                    <div key={preset.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-lg">{preset.icon}</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {preset.name}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">
                                    {preset.description}
                                </p>
                            </div>
                            <button
                                onClick={() => generateSuggestion(preset.id)}
                                disabled={isGenerating || !jdText.trim()}
                                className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {isGenerating ? 'Generating...' : 'Preview'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Constraints */}
            <div className="border-t border-gray-200 pt-4">
                <h4 className="text-xs font-semibold text-gray-900 mb-2">Constraints</h4>
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Word limit</span>
                        <select className="text-xs border border-gray-300 rounded px-2 py-1">
                            <option>50 words</option>
                            <option>100 words</option>
                            <option>150 words</option>
                            <option>No limit</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Tone</span>
                        <select className="text-xs border border-gray-300 rounded px-2 py-1">
                            <option>Professional</option>
                            <option>Confident</option>
                            <option>Concise</option>
                            <option>Match JD</option>
                        </select>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                        <input
                            type="checkbox"
                            id="no-fabrication"
                            className="rounded"
                        />
                        <label htmlFor="no-fabrication" className="text-gray-600">
                            No fabrication (M1 UI only)
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}
