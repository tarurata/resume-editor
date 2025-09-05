'use client'

import { useState, useEffect } from 'react'
import { WizardState, ParsedSection } from '@/types/resume'

interface TextParserProps {
    pastedText: string
    onNext: (updates: Partial<WizardState>) => void
}

export default function TextParser({ pastedText, onNext }: TextParserProps) {
    const [parsedSections, setParsedSections] = useState<ParsedSection[]>([])
    const [selectedSections, setSelectedSections] = useState<Set<number>>(new Set())

    useEffect(() => {
        // Simple text parsing logic - in a real app, this would be more sophisticated
        const sections = parseTextIntoSections(pastedText)
        setParsedSections(sections)
    }, [pastedText])

    const parseTextIntoSections = (text: string): ParsedSection[] => {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
        const sections: ParsedSection[] = []
        let currentIndex = 0

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            const startIndex = text.indexOf(line, currentIndex)
            const endIndex = startIndex + line.length

            // Detect title (usually first line or contains "resume", "cv", etc.)
            if (i === 0 || line.toLowerCase().includes('resume') || line.toLowerCase().includes('cv')) {
                sections.push({
                    type: 'title',
                    content: line,
                    startIndex,
                    endIndex
                })
            }
            // Detect summary (contains keywords like "summary", "objective", "profile")
            else if (line.toLowerCase().includes('summary') ||
                line.toLowerCase().includes('objective') ||
                line.toLowerCase().includes('profile')) {
                sections.push({
                    type: 'summary',
                    content: line,
                    startIndex,
                    endIndex
                })
            }
            // Detect experience (contains keywords like "experience", "work", "employment")
            else if (line.toLowerCase().includes('experience') ||
                line.toLowerCase().includes('work history') ||
                line.toLowerCase().includes('employment')) {
                sections.push({
                    type: 'experience',
                    content: line,
                    startIndex,
                    endIndex
                })
            }
            // Detect skills (contains keywords like "skills", "technologies", "competencies")
            else if (line.toLowerCase().includes('skills') ||
                line.toLowerCase().includes('technologies') ||
                line.toLowerCase().includes('competencies')) {
                sections.push({
                    type: 'skills',
                    content: line,
                    startIndex,
                    endIndex
                })
            }
            // Detect job entries (lines that look like job titles with company names)
            else if (isJobEntry(line)) {
                sections.push({
                    type: 'experience',
                    content: line,
                    startIndex,
                    endIndex
                })
            }

            currentIndex = endIndex
        }

        return sections
    }

    const isJobEntry = (line: string): boolean => {
        // Simple heuristic: lines that contain common job title keywords
        const jobKeywords = ['engineer', 'developer', 'manager', 'analyst', 'specialist', 'coordinator', 'director', 'lead', 'senior', 'junior']
        return jobKeywords.some(keyword => line.toLowerCase().includes(keyword))
    }

    const toggleSection = (index: number) => {
        const newSelected = new Set(selectedSections)
        if (newSelected.has(index)) {
            newSelected.delete(index)
        } else {
            newSelected.add(index)
        }
        setSelectedSections(newSelected)
    }

    const handleContinue = () => {
        const selectedSectionsData = parsedSections.filter((_, index) => selectedSections.has(index))
        onNext({
            step: 'edit',
            parsedSections: selectedSectionsData
        })
    }

    const getSectionColor = (type: ParsedSection['type']) => {
        switch (type) {
            case 'title': return 'bg-blue-100 text-blue-800'
            case 'summary': return 'bg-green-100 text-green-800'
            case 'experience': return 'bg-purple-100 text-purple-800'
            case 'skills': return 'bg-orange-100 text-orange-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Mark Resume Sections
                </h2>
                <p className="text-gray-600">
                    We've detected potential sections in your text. Select the ones you want to include in your resume.
                </p>
            </div>

            <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Detected Sections</h3>
                <div className="space-y-3">
                    {parsedSections.map((section, index) => (
                        <div
                            key={index}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedSections.has(index)
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                            onClick={() => toggleSection(index)}
                        >
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={selectedSections.has(index)}
                                    onChange={() => toggleSection(index)}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <span className={`px-2 py-1 text-xs font-medium rounded ${getSectionColor(section.type)}`}>
                                    {section.type.toUpperCase()}
                                </span>
                                <span className="text-gray-900">{section.content}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {parsedSections.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No sections detected. You can still continue to manually create sections.
                    </div>
                )}
            </div>

            <div className="flex justify-between">
                <button
                    onClick={() => onNext({ step: 'start' })}
                    className="btn-secondary"
                >
                    Back
                </button>
                <button
                    onClick={handleContinue}
                    className="btn-primary"
                >
                    Continue to Editor
                </button>
            </div>
        </div>
    )
}
