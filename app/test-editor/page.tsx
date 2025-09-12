'use client'

import { useState } from 'react'
import { Resume, SectionId } from '@/types/resume'
import { SectionsTree } from '@/components/editor/SectionsTree'
import { RichEditor } from '@/components/editor/RichEditor'
import { JobDescriptionPanel } from '@/components/editor/JobDescriptionPanel'

export default function TestEditorPage() {
    const [selectedSection, setSelectedSection] = useState<SectionId | null>(null)
    const [currentContent, setCurrentContent] = useState('')
    const [jdText, setJdText] = useState('')

    // Sample resume data
    const resume: Resume = {
        title: "Senior Software Engineer",
        summary: "Experienced full-stack developer with 5+ years building scalable web applications using React, Node.js, and cloud technologies. Passionate about clean code, user experience, and mentoring junior developers.",
        experience: [
            {
                role: "Senior Software Engineer",
                organization: "TechCorp Inc.",
                location: "San Francisco, CA",
                startDate: "2021-03",
                endDate: null,
                bullets: [
                    "Led development of microservices architecture serving 1M+ daily active users",
                    "Improved application performance by 40% through code optimization and caching strategies",
                    "Mentored 3 junior developers and established code review best practices",
                    "Implemented CI/CD pipelines reducing deployment time from 2 hours to 15 minutes"
                ]
            },
            {
                role: "Software Engineer",
                organization: "StartupXYZ",
                location: "Remote",
                startDate: "2019-06",
                endDate: "2021-02",
                bullets: [
                    "Built responsive React applications with TypeScript and Redux",
                    "Developed RESTful APIs using Node.js and Express",
                    "Collaborated with design team to implement pixel-perfect UI components",
                    "Participated in agile development process with 2-week sprints"
                ]
            }
        ],
        skills: [
            "JavaScript",
            "TypeScript",
            "React",
            "Node.js",
            "Python",
            "AWS",
            "Docker",
            "PostgreSQL",
            "MongoDB",
            "Git",
            "Agile/Scrum",
            "RESTful APIs"
        ]
    }

    const handleSectionSelect = (sectionId: SectionId, content: string) => {
        setSelectedSection(sectionId)
        setCurrentContent(content)
    }

    const handleContentChange = (content: string) => {
        setCurrentContent(content)
    }

    const handleJdChange = (jdText: string) => {
        setJdText(jdText)
    }

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Resume Editor - Test</h1>
                    <div className="flex items-center space-x-4">
                        <button className="btn-primary">
                            Export PDF
                        </button>
                        <a href="/" className="btn-secondary">
                            ← Back to Wizard
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Editor Layout */}
            <div className="flex h-[calc(100vh-80px)]">
                {/* Left Panel - Sections Tree */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                    <SectionsTree
                        resume={resume}
                        selectedSection={selectedSection}
                        onSectionSelect={handleSectionSelect}
                    />
                </div>

                {/* Center Panel - Rich Editor */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 p-6">
                        <RichEditor
                            content={currentContent}
                            onChange={handleContentChange}
                            selectedSection={selectedSection}
                        />
                    </div>
                </div>

                {/* Right Panel - Job Description */}
                <div className="w-80 bg-white border-l border-gray-200">
                    <JobDescriptionPanel
                        jdText={jdText}
                        onJdChange={handleJdChange}
                    />
                </div>
            </div>
        </main>
    )
}
