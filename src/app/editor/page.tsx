'use client'

import { useState, useEffect } from 'react'
import { Resume } from '@/types/resume'
import { loadResumeFromLocalStorage } from '@/lib/storage'
import Link from 'next/link'
import { SectionsTree } from '@/components/editor/SectionsTree'
import { RichEditor } from '@/components/editor/RichEditor'
import { JobDescriptionPanel } from '@/components/editor/JobDescriptionPanel'
import { StrategyPresets } from '@/components/editor/StrategyPresets'
import { DiffPreview } from '@/components/editor/DiffPreview'

export type SectionType = 'title' | 'summary' | 'experience' | 'skills'
export type SectionId = string

export interface EditorState {
    selectedSection: SectionId | null
    originalContent: string
    currentContent: string
    hasChanges: boolean
    jdText: string
}

export default function EditorPage() {
    const [resume, setResume] = useState<Resume | null>(null)
    const [loading, setLoading] = useState(true)
    const [editorState, setEditorState] = useState<EditorState>({
        selectedSection: null,
        originalContent: '',
        currentContent: '',
        hasChanges: false,
        jdText: ''
    })

    useEffect(() => {
        const loadedResume = loadResumeFromLocalStorage()
        setResume(loadedResume)
        setLoading(false)
    }, [])

    const handleSectionSelect = (sectionId: SectionId, content: string) => {
        setEditorState(prev => ({
            ...prev,
            selectedSection: sectionId,
            originalContent: content,
            currentContent: content,
            hasChanges: false
        }))
    }

    const handleContentChange = (content: string) => {
        setEditorState(prev => ({
            ...prev,
            currentContent: content,
            hasChanges: content !== prev.originalContent
        }))
    }

    const handleJdChange = (jdText: string) => {
        setEditorState(prev => ({
            ...prev,
            jdText
        }))
    }

    const handleAcceptChanges = () => {
        setEditorState(prev => ({
            ...prev,
            originalContent: prev.currentContent,
            hasChanges: false
        }))
    }

    const handleRejectChanges = () => {
        setEditorState(prev => ({
            ...prev,
            currentContent: prev.originalContent,
            hasChanges: false
        }))
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
                    <h1 className="text-2xl font-bold text-gray-900">Resume Editor</h1>
                    <div className="flex items-center space-x-4">
                        {editorState.hasChanges && (
                            <span className="text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                                Unsaved changes
                            </span>
                        )}
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
                        <RichEditor
                            content={editorState.currentContent}
                            onChange={handleContentChange}
                            selectedSection={editorState.selectedSection}
                        />
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
        </main>
    )
}
