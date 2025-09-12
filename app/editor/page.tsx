'use client'

import { useState, useEffect } from 'react'
import { Resume, DiffState, ChangeEntry, SectionType, SectionId } from '@/types/resume'
import { loadResumeFromDatabase, saveResumeToDatabase } from '@/lib/storage'
import { addChangeToHistory, getSectionHistory } from '@/lib/history'
import Link from 'next/link'
import { SectionsTree } from '@/components/editor/SectionsTree'
import { RichEditor } from '@/components/editor/RichEditor'
import { JobDescriptionPanel } from '@/components/editor/JobDescriptionPanel'
import { StrategyPresets } from '@/components/editor/StrategyPresets'
import { DiffPreview } from '@/components/editor/DiffPreview'
import { ChangeHistoryPanel } from '@/components/editor/ChangeHistoryPanel'
import { PrintView } from '@/components/editor/PrintView'
import { ClientOnly } from '@/components/ClientOnly'
import ApiStatus from '@/components/ApiStatus'


export interface EditorState {
    selectedSection: SectionId | null
    originalContent: string
    currentContent: string
    hasChanges: boolean
    jdText: string
    diffState: DiffState
    sectionHistory: Record<string, string> // sectionId -> original content when first loaded
    showPrintView: boolean
    isSaving: boolean
    saveError: string | null
}

export default function EditorPage() {
    const [resume, setResume] = useState<Resume | null>(null)
    const [loading, setLoading] = useState(true)
    const [editorState, setEditorState] = useState<EditorState>({
        selectedSection: null,
        originalContent: '',
        currentContent: '',
        hasChanges: false,
        jdText: '',
        diffState: { viewMode: 'clean', showHistory: false },
        sectionHistory: {},
        showPrintView: false,
        isSaving: false,
        saveError: null
    })

    useEffect(() => {
        const loadResume = async () => {
            try {
                const loadedResume = await loadResumeFromDatabase()

                if (loadedResume) {
                    setResume(loadedResume)
                } else {
                    // Load sample data for testing
                    const sampleResume: Resume = {
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
                    setResume(sampleResume)
                }
            } catch (error) {
                console.error('Failed to load resume:', error)
                setEditorState(prev => ({
                    ...prev,
                    saveError: 'Failed to load resume from database'
                }))
            } finally {
                setLoading(false)
            }
        }

        loadResume()
    }, [])

    const handleSectionSelect = (sectionId: SectionId, content: string) => {
        setEditorState(prev => {
            // Store the original content for this section if not already stored
            const sectionHistory = { ...prev.sectionHistory }
            if (!sectionHistory[sectionId]) {
                sectionHistory[sectionId] = content
            }

            return {
                ...prev,
                selectedSection: sectionId,
                originalContent: content,
                currentContent: content,
                hasChanges: false,
                sectionHistory
            }
        })
    }

    const handleContentChange = (content: string) => {
        setEditorState(prev => ({
            ...prev,
            currentContent: content,
            hasChanges: content !== prev.originalContent,
            saveError: null // Clear any previous save errors
        }))
    }

    const handleJdChange = (jdText: string) => {
        setEditorState(prev => ({
            ...prev,
            jdText
        }))
    }

    const handleAcceptChanges = () => {
        if (!editorState.selectedSection || !resume) return

        // Record the change in history
        addChangeToHistory(
            editorState.selectedSection,
            editorState.originalContent,
            editorState.currentContent,
            'accept',
            'User accepted changes'
        )

        // Update the resume data
        const updatedResume = { ...resume }
        const content = editorState.currentContent

        switch (editorState.selectedSection) {
            case 'title':
                // Extract text from HTML
                updatedResume.title = content.replace(/<[^>]*>/g, '')
                break
            case 'summary':
                updatedResume.summary = content.replace(/<[^>]*>/g, '')
                break
            case 'skills':
                // Extract list items from HTML
                const skillMatches = content.match(/<li>(.*?)<\/li>/g)
                if (skillMatches) {
                    updatedResume.skills = skillMatches.map(match =>
                        match.replace(/<\/?li>/g, '').trim()
                    )
                }
                break
            default:
                if (editorState.selectedSection.startsWith('experience-')) {
                    const index = parseInt(editorState.selectedSection.split('-')[1])
                    if (updatedResume.experience?.[index]) {
                        const bulletMatches = content.match(/<li>(.*?)<\/li>/g)
                        if (bulletMatches) {
                            updatedResume.experience[index].bullets = bulletMatches.map(match =>
                                match.replace(/<\/?li>/g, '').trim()
                            )
                        }
                    }
                }
                break
        }

        setResume(updatedResume)

        setEditorState(prev => ({
            ...prev,
            originalContent: prev.currentContent,
            hasChanges: false
        }))
    }

    const handleRejectChanges = () => {
        if (!editorState.selectedSection) return

        // Record the rejection in history
        addChangeToHistory(
            editorState.selectedSection,
            editorState.originalContent,
            editorState.currentContent,
            'reject',
            'User rejected changes'
        )

        setEditorState(prev => ({
            ...prev,
            currentContent: prev.originalContent,
            hasChanges: false
        }))
    }

    const handleRestoreOriginal = () => {
        if (!editorState.selectedSection) return

        const originalContent = editorState.sectionHistory[editorState.selectedSection]
        if (!originalContent) return

        // Record the restore in history
        addChangeToHistory(
            editorState.selectedSection,
            editorState.currentContent,
            originalContent,
            'restore',
            'User restored to original'
        )

        setEditorState(prev => ({
            ...prev,
            originalContent,
            currentContent: originalContent,
            hasChanges: false
        }))
    }

    const handleRestoreToChange = (change: ChangeEntry) => {
        if (!editorState.selectedSection) return

        // Record the restore to specific change in history
        addChangeToHistory(
            editorState.selectedSection,
            editorState.currentContent,
            change.newContent,
            'restore',
            `Restored to change from ${change.timestamp.toLocaleString()}`
        )

        setEditorState(prev => ({
            ...prev,
            originalContent: change.newContent,
            currentContent: change.newContent,
            hasChanges: false
        }))
    }

    const handleDiffStateChange = (newDiffState: DiffState) => {
        setEditorState(prev => ({
            ...prev,
            diffState: newDiffState
        }))
    }

    const handleExportPDF = () => {
        setEditorState(prev => ({
            ...prev,
            showPrintView: true
        }))
    }

    const handleClosePrintView = () => {
        setEditorState(prev => ({
            ...prev,
            showPrintView: false
        }))
    }

    const handleSaveResume = async () => {
        if (!resume) {
            console.error('No resume data to save')
            return
        }

        console.log('Starting save process for resume:', resume)
        setEditorState(prev => ({
            ...prev,
            isSaving: true,
            saveError: null
        }))

        try {
            console.log('Calling saveResumeToDatabase...')
            await saveResumeToDatabase(resume, 'Default Company', resume.title || 'Software Engineer')
            console.log('Resume saved successfully')

            setEditorState(prev => ({
                ...prev,
                isSaving: false,
                hasChanges: false
            }))
        } catch (error) {
            console.error('Failed to save resume:', error)
            let errorMessage = 'Failed to save resume'

            if (error instanceof Error) {
                errorMessage = error.message
            }

            setEditorState(prev => ({
                ...prev,
                isSaving: false,
                saveError: errorMessage
            }))
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading resume...</p>
                </div>
            </div>
        )
    }

    if (!resume) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">No Resume Found</h1>
                    <p className="text-gray-600 mb-6">You need to create a resume first.</p>
                    <Link href="/" className="btn-primary">
                        Create Resume
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-2xl font-bold text-gray-900">Resume Editor</h1>
                        <ApiStatus />
                    </div>
                    <div className="flex items-center space-x-4">
                        {editorState.hasChanges && (
                            <span className="text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                                Unsaved changes
                            </span>
                        )}
                        {editorState.saveError && (
                            <span className="text-sm text-red-600 bg-red-100 px-3 py-1 rounded-full">
                                {editorState.saveError}
                            </span>
                        )}
                        <button
                            onClick={handleSaveResume}
                            disabled={editorState.isSaving}
                            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {editorState.isSaving ? 'Saving...' : 'Save Resume'}
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="btn-primary"
                        >
                            Export PDF
                        </button>
                        <Link href="/" className="btn-secondary">
                            ← Back to Wizard
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Editor Layout */}
            <div className="flex h-[calc(100vh-80px)]">
                {/* Left Panel - Sections Tree */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                    <SectionsTree
                        resume={resume}
                        selectedSection={editorState.selectedSection}
                        onSectionSelect={handleSectionSelect}
                    />
                </div>

                {/* Center Panel - Rich Editor */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 p-6">
                        <ClientOnly fallback={
                            <div className="h-full flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            </div>
                        }>
                            <RichEditor
                                content={editorState.currentContent}
                                onChange={handleContentChange}
                                selectedSection={editorState.selectedSection}
                            />
                        </ClientOnly>
                    </div>

                    {/* Strategy Presets */}
                    {editorState.selectedSection && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                            <StrategyPresets
                                sectionId={editorState.selectedSection}
                                jdText={editorState.jdText}
                                currentContent={editorState.currentContent}
                                onContentChange={handleContentChange}
                            />
                        </div>
                    )}

                    {/* Diff Preview */}
                    {editorState.hasChanges && editorState.selectedSection && (
                        <DiffPreview
                            originalContent={editorState.originalContent}
                            currentContent={editorState.currentContent}
                            onAccept={handleAcceptChanges}
                            onReject={handleRejectChanges}
                            onRestore={handleRestoreOriginal}
                            diffState={editorState.diffState}
                            onDiffStateChange={handleDiffStateChange}
                        />
                    )}

                    {/* Change History Panel */}
                    {editorState.selectedSection && (
                        <ChangeHistoryPanel
                            sectionId={editorState.selectedSection}
                            diffState={editorState.diffState}
                            onDiffStateChange={handleDiffStateChange}
                            onRestoreToChange={handleRestoreToChange}
                        />
                    )}
                </div>

                {/* Right Panel - Job Description */}
                <div className="w-80 bg-white border-l border-gray-200">
                    <JobDescriptionPanel
                        jdText={editorState.jdText}
                        onJdChange={handleJdChange}
                    />
                </div>
            </div>

            {/* Print View Modal */}
            {editorState.showPrintView && resume && (
                <PrintView
                    resume={resume}
                    onClose={handleClosePrintView}
                />
            )}
        </main>
    )
}
