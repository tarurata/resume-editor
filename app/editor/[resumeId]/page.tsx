'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Resume, DiffState, ChangeEntry, SectionType, SectionId } from '@/types/resume'
import { ResumeService, ResumeListItem } from '@/lib/resumeService'
import { addChangeToHistory, getSectionHistory } from '@/lib/history'
import { syncExperiencesToDatabase } from '@/lib/experiencesApi'
import Link from 'next/link'
import { SectionsTree } from '@/components/editor/SectionsTree'
import { RichEditor } from '@/components/editor/RichEditor'
import { JobDescriptionPanel } from '@/components/editor/JobDescriptionPanel'
import { StrategyPresets } from '@/components/editor/StrategyPresets'
import { DiffPreview } from '@/components/editor/DiffPreview'
import { ChangeHistoryPanel } from '@/components/editor/ChangeHistoryPanel'
import { PrintView } from '@/components/editor/PrintView'
import { ExperienceEditor } from '@/components/editor/ExperienceEditor'
import { ClientOnly } from '@/components/ClientOnly'
import ApiStatus from '@/components/ApiStatus'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'

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

interface EditorPageProps {
    params: {
        resumeId: string
    }
}

export default function EditorPage({ params }: EditorPageProps) {
    const { resumeId } = params
    const router = useRouter()
    const [resumeListItem, setResumeListItem] = useState<ResumeListItem | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
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
                setLoading(true)
                setError(null)

                const resumeData = await ResumeService.getResumeById(resumeId)

                if (!resumeData) {
                    setError('Resume not found')
                    return
                }

                setResumeListItem(resumeData)

                // Set job description if available
                if (resumeData.job_description) {
                    setEditorState(prev => ({
                        ...prev,
                        jdText: resumeData.job_description || ''
                    }))
                }
            } catch (err) {
                console.error('Failed to load resume:', err)
                setError('Failed to load resume')
            } finally {
                setLoading(false)
            }
        }

        if (resumeId) {
            loadResume()
        }
    }, [resumeId])

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

    const handleExperienceUpdate = async (index: number, updatedExperience: any) => {
        if (!resumeListItem) return

        const updatedResume = { ...resumeListItem.resume_data }
        if (updatedResume.experience) {
            updatedResume.experience[index] = updatedExperience
        }

        const updatedResumeListItem = {
            ...resumeListItem,
            resume_data: updatedResume
        }

        setResumeListItem(updatedResumeListItem)

        // Auto-save the changes
        try {
            const { saveResumeToDatabase } = await import('@/lib/storage')
            await saveResumeToDatabase(
                updatedResume,
                updatedResumeListItem.company_name,
                updatedResumeListItem.job_title,
                updatedResumeListItem.company_email,
                editorState.jdText
            )
            console.log('Experience changes auto-saved successfully')

            // NEW: Also sync to database tables for immediate persistence
            if (updatedResume.experience && updatedResume.experience.length > 0) {
                console.log('Auto-syncing experiences to database...')
                await syncExperiencesToDatabase(
                    resumeId,
                    updatedResume.experience
                )
                console.log('Experiences auto-synced successfully')
            }
        } catch (error) {
            console.error('Failed to auto-save experience changes:', error)
            // Don't show error to user for auto-save failures
        }
    }

    const handleAcceptChanges = async () => {
        if (!editorState.selectedSection || !resumeListItem) return

        // For experience sections, changes are already saved via handleExperienceUpdate
        if (editorState.selectedSection.startsWith('experience-')) {
            // Just auto-save the current state
            try {
                const { saveResumeToDatabase } = await import('@/lib/storage')
                await saveResumeToDatabase(
                    resumeListItem.resume_data,
                    resumeListItem.company_name,
                    resumeListItem.job_title,
                    resumeListItem.company_email,
                    editorState.jdText
                )
                console.log('Experience changes auto-saved successfully')
            } catch (error) {
                console.error('Failed to auto-save experience changes:', error)
            }
            return
        }

        // Record the change in history
        addChangeToHistory(
            editorState.selectedSection,
            editorState.originalContent,
            editorState.currentContent,
            'accept',
            'User accepted changes'
        )

        // Update the resume data
        const updatedResume = { ...resumeListItem.resume_data }
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
        }

        // Update local state
        const updatedResumeListItem = {
            ...resumeListItem,
            resume_data: updatedResume,
            job_description: editorState.jdText
        }

        setResumeListItem(updatedResumeListItem)

        setEditorState(prev => ({
            ...prev,
            originalContent: prev.currentContent,
            hasChanges: false
        }))

        // Auto-save the changes
        try {
            const { saveResumeToDatabase } = await import('@/lib/storage')
            await saveResumeToDatabase(
                updatedResume,
                updatedResumeListItem.company_name,
                updatedResumeListItem.job_title,
                updatedResumeListItem.company_email,
                updatedResumeListItem.job_description
            )
            console.log('Changes auto-saved successfully')
        } catch (error) {
            console.error('Failed to auto-save changes:', error)
            // Don't show error to user for auto-save failures
        }
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
        if (!resumeListItem) {
            console.error('No resume data to save')
            return
        }

        console.log('Starting save process for resume:', resumeListItem)
        setEditorState(prev => ({
            ...prev,
            isSaving: true,
            saveError: null
        }))

        try {
            console.log('Calling ResumeService to update resume...')
            // Update the resume list item with current job description
            const updatedResumeListItem = {
                ...resumeListItem,
                job_description: editorState.jdText
            }
            
            // Save the main resume data (existing functionality)
            const { saveResumeToDatabase } = await import('@/lib/storage')
            await saveResumeToDatabase(
                updatedResumeListItem.resume_data,
                updatedResumeListItem.company_name,
                updatedResumeListItem.job_title,
                updatedResumeListItem.company_email,
                updatedResumeListItem.job_description
            )
            console.log('Resume saved successfully')

            // NEW: Sync experiences and achievements to database tables
            if (updatedResumeListItem.resume_data.experience && updatedResumeListItem.resume_data.experience.length > 0) {
                console.log('Syncing experiences and achievements to database...')
                await syncExperiencesToDatabase(
                    resumeId, // resume version ID
                    updatedResumeListItem.resume_data.experience
                )
                console.log('Experiences and achievements synced successfully')
            }

            // Update the local state with the saved data
            setResumeListItem(updatedResumeListItem)

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

    if (error || !resumeListItem) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        {error === 'Resume not found' ? 'Resume Not Found' : 'Error Loading Resume'}
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {error === 'Resume not found'
                            ? 'The resume you are looking for does not exist or has been deleted.'
                            : 'There was an error loading the resume. Please try again.'
                        }
                    </p>
                    <div className="space-x-4">
                        <Link href="/resumes" className="btn-primary">
                            View All Resumes
                        </Link>
                        <Link href="/resumes/new" className="btn-secondary">
                            Create New Resume
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const resume = resumeListItem.resume_data

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Breadcrumbs
                            items={[
                                { label: 'Resumes', href: '/resumes' },
                                { label: resumeListItem.job_title, href: `/editor/${resumeId}` }
                            ]}
                        />
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
                        <Link href="/resumes" className="btn-secondary">
                            ← Back to Resumes
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
                            {editorState.selectedSection && editorState.selectedSection.startsWith('experience-') ? (
                                <div className="h-full overflow-y-auto">
                                    {(() => {
                                        const index = parseInt(editorState.selectedSection.split('-')[1])
                                        const experience = resume.experience?.[index]
                                        if (experience) {
                                            return (
                                                <ExperienceEditor
                                                    experience={experience}
                                                    index={index}
                                                    onUpdate={handleExperienceUpdate}
                                                />
                                            )
                                        }
                                        return <div>Experience not found</div>
                                    })()}
                                </div>
                            ) : (
                                <RichEditor
                                    content={editorState.currentContent}
                                    onChange={handleContentChange}
                                    selectedSection={editorState.selectedSection}
                                />
                            )}
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
