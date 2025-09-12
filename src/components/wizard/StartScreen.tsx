'use client'

import { useState } from 'react'
import { WizardState, Template } from '@/types/resume'
import { templates } from '@/lib/templates'

interface StartScreenProps {
    onNext: (updates: Partial<WizardState>) => void
}

export default function StartScreen({ onNext }: StartScreenProps) {
    const [selectedOption, setSelectedOption] = useState<'template' | 'paste' | null>(null)
    const [pastedText, setPastedText] = useState('')

    const handleTemplateSelect = (template: Template) => {
        onNext({
            step: 'validate',
            selectedTemplate: template.id,
            resume: template.data
        })
    }

    const handlePasteSubmit = () => {
        if (!pastedText.trim()) {
            return
        }

        onNext({
            step: 'parse',
            pastedText: pastedText.trim()
        })
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Create Your Resume
                </h2>
                <p className="text-gray-600">
                    Choose a template to get started quickly, or paste your existing resume text to parse and edit.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Template Selection */}
                <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Start from Template</h3>
                    <p className="text-gray-600 mb-6">
                        Choose a professional template to get started quickly.
                    </p>

                    <div className="space-y-3">
                        {templates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => handleTemplateSelect(template)}
                                className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                            >
                                <div className="font-medium text-gray-900">{template.name}</div>
                                <div className="text-sm text-gray-600 mt-1">{template.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Text Pasting */}
                <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Paste Resume Text</h3>
                    <p className="text-gray-600 mb-4">
                        Paste your existing resume text and we'll help you organize it into sections.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <textarea
                                value={pastedText}
                                onChange={(e) => setPastedText(e.target.value)}
                                placeholder="Paste your resume text here...

Example:
John Doe
Senior Software Engineer
john.doe@email.com | (555) 123-4567

EXPERIENCE
Senior Software Engineer at TechCorp (2021-Present)
• Led development of microservices architecture
• Improved application performance by 40%
• Mentored 3 junior developers

SKILLS
JavaScript, TypeScript, React, Node.js, Python, AWS"
                                className="input-field h-32 resize-none"
                            />
                            <div className="flex justify-between items-center mt-2">
                                <span className={`text-sm ${pastedText.trim() ? 'text-green-600' : 'text-gray-500'}`}>
                                    {pastedText.trim() ? '✓ Ready to parse' : 'Enter resume text to continue'}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {pastedText.length} characters
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handlePasteSubmit}
                            disabled={!pastedText.trim()}
                            className={`w-full font-medium py-2 px-4 rounded-lg transition-colors ${pastedText.trim()
                                    ? 'btn-primary'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            Parse Resume Text
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
