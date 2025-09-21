'use client'

import { useState } from 'react'
import { aiResumeExtractor } from '@/lib/aiResumeExtractor'
import { AIExtractionResult } from '@/lib/aiResumeExtractor'

export default function AIDemoPage() {
    const [resumeText, setResumeText] = useState('')
    const [extractionResult, setExtractionResult] = useState<AIExtractionResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const sampleResume = `John Doe
Software Engineer
john.doe@example.com
+1 (555) 123-4567
https://linkedin.com/in/johndoe
https://github.com/johndoe

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years of experience in full-stack development. 
Skilled in JavaScript, Python, React, and Node.js. Passionate about building scalable 
web applications and leading development teams.

EXPERIENCE
Senior Software Engineer | Tech Corp | 2020-2023
• Led development of microservices architecture serving 1M+ users
• Mentored junior developers and conducted code reviews
• Implemented CI/CD pipelines reducing deployment time by 50%

Software Engineer | StartupXYZ | 2018-2020
• Built responsive web applications using React and Node.js
• Collaborated with product team to define technical requirements
• Optimized database queries improving performance by 30%

EDUCATION
Bachelor of Computer Science | University of Technology | 2018
• Graduated Magna Cum Laude
• Relevant coursework: Data Structures, Algorithms, Software Engineering

SKILLS
Technical Skills: JavaScript, Python, React, Node.js, PostgreSQL, AWS
Languages: English (Native), Spanish (Conversational)
Certifications: AWS Certified Developer, Google Cloud Professional`

    const handleExtract = async () => {
        if (!resumeText.trim()) return

        setIsLoading(true)
        setError(null)
        setExtractionResult(null)

        try {
            const result = await aiResumeExtractor.extractResume(resumeText)
            setExtractionResult(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Extraction failed')
        } finally {
            setIsLoading(false)
        }
    }

    const handleUseSample = () => {
        setResumeText(sampleResume)
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        AI Resume Extraction Demo
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        This demo shows how AI can extract structured information from resume text,
                        replacing the previous regex-based approach with more accurate AI-powered extraction.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">Resume Text</h2>
                            <button
                                onClick={handleUseSample}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Use Sample Resume
                            </button>
                        </div>

                        <textarea
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            placeholder="Paste your resume text here..."
                            className="w-full h-96 p-4 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />

                        <button
                            onClick={handleExtract}
                            disabled={!resumeText.trim() || isLoading}
                            className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? 'Extracting with AI...' : 'Extract with AI'}
                        </button>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900">Extraction Results</h2>

                        {isLoading && (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                <span className="ml-3 text-gray-600">AI is analyzing the resume...</span>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-800">Error: {error}</p>
                            </div>
                        )}

                        {extractionResult && (
                            <div className="space-y-6">
                                {/* Confidence Score */}
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                                    <h3 className="font-semibold text-blue-900 mb-2">Extraction Confidence</h3>
                                    <div className="flex items-center">
                                        <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${extractionResult.confidence * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-medium text-blue-900">
                                            {Math.round(extractionResult.confidence * 100)}%
                                        </span>
                                    </div>
                                </div>

                                {/* Personal Information */}
                                {extractionResult.personalInfo && (
                                    <div className="p-4 bg-white border border-gray-200 rounded-md">
                                        <h3 className="font-semibold text-gray-900 mb-3">Personal Information</h3>
                                        <div className="space-y-2 text-sm">
                                            {extractionResult.personalInfo.name && (
                                                <p><span className="font-medium">Name:</span> {extractionResult.personalInfo.name}</p>
                                            )}
                                            {extractionResult.personalInfo.email && (
                                                <p><span className="font-medium">Email:</span> {extractionResult.personalInfo.email}</p>
                                            )}
                                            {extractionResult.personalInfo.phone && (
                                                <p><span className="font-medium">Phone:</span> {extractionResult.personalInfo.phone}</p>
                                            )}
                                            {extractionResult.personalInfo.linkedin && (
                                                <p><span className="font-medium">LinkedIn:</span> {extractionResult.personalInfo.linkedin}</p>
                                            )}
                                            {extractionResult.personalInfo.github && (
                                                <p><span className="font-medium">GitHub:</span> {extractionResult.personalInfo.github}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Detected Sections */}
                                {extractionResult.sections.length > 0 && (
                                    <div className="p-4 bg-white border border-gray-200 rounded-md">
                                        <h3 className="font-semibold text-gray-900 mb-3">Detected Sections ({extractionResult.sections.length})</h3>
                                        <div className="space-y-2">
                                            {extractionResult.sections.map((section, index) => (
                                                <div key={index} className="flex items-start space-x-3">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded ${section.type === 'title' ? 'bg-blue-100 text-blue-800' :
                                                            section.type === 'summary' ? 'bg-green-100 text-green-800' :
                                                                section.type === 'experience' ? 'bg-purple-100 text-purple-800' :
                                                                    section.type === 'skills' ? 'bg-orange-100 text-orange-800' :
                                                                        section.type === 'education' ? 'bg-indigo-100 text-indigo-800' :
                                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {section.type.toUpperCase()}
                                                    </span>
                                                    <span className="text-sm text-gray-700 flex-1">{section.content}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Structured Resume Data */}
                                {extractionResult.structuredResume && (
                                    <div className="p-4 bg-white border border-gray-200 rounded-md">
                                        <h3 className="font-semibold text-gray-900 mb-3">Structured Data</h3>
                                        <div className="space-y-3 text-sm">
                                            {extractionResult.structuredResume.title && (
                                                <div>
                                                    <span className="font-medium">Title:</span> {extractionResult.structuredResume.title}
                                                </div>
                                            )}
                                            {extractionResult.structuredResume.summary && (
                                                <div>
                                                    <span className="font-medium">Summary:</span> {extractionResult.structuredResume.summary}
                                                </div>
                                            )}
                                            {extractionResult.structuredResume.experience && extractionResult.structuredResume.experience.length > 0 && (
                                                <div>
                                                    <span className="font-medium">Experience:</span> {extractionResult.structuredResume.experience.length} entries
                                                </div>
                                            )}
                                            {extractionResult.structuredResume.education && extractionResult.structuredResume.education.length > 0 && (
                                                <div>
                                                    <span className="font-medium">Education:</span> {extractionResult.structuredResume.education.length} entries
                                                </div>
                                            )}
                                            {extractionResult.structuredResume.skills && extractionResult.structuredResume.skills.length > 0 && (
                                                <div>
                                                    <span className="font-medium">Skills:</span> {extractionResult.structuredResume.skills.length} categories
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Errors */}
                                {extractionResult.errors.length > 0 && (
                                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                        <h3 className="font-semibold text-yellow-900 mb-2">Warnings</h3>
                                        <ul className="text-sm text-yellow-800 space-y-1">
                                            {extractionResult.errors.map((error, index) => (
                                                <li key={index}>• {error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {!isLoading && !extractionResult && !error && (
                            <div className="text-center py-8 text-gray-500">
                                Enter resume text and click "Extract with AI" to see the results
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

