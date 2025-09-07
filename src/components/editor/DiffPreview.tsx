'use client'

import { useState } from 'react'
import { DiffState } from '@/types/resume'

interface DiffPreviewProps {
    originalContent: string
    currentContent: string
    onAccept: () => void
    onReject: () => void
    onRestore?: () => void
    diffState?: DiffState
    onDiffStateChange?: (state: DiffState) => void
}

export function DiffPreview({
    originalContent,
    currentContent,
    onAccept,
    onReject,
    onRestore,
    diffState = { viewMode: 'clean', showHistory: false },
    onDiffStateChange
}: DiffPreviewProps) {
    const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side')

    if (originalContent === currentContent) {
        return null
    }

    // HTML-safe diff rendering
    const createHtmlDiff = (original: string, current: string) => {
        // Simple word-level diff for HTML content
        const originalWords = original.split(/(\s+)/)
        const currentWords = current.split(/(\s+)/)

        const diff = []
        let i = 0, j = 0

        while (i < originalWords.length || j < currentWords.length) {
            const origWord = originalWords[i] || ''
            const currWord = currentWords[j] || ''

            if (origWord === currWord) {
                diff.push({ type: 'unchanged', content: origWord })
                i++
                j++
            } else if (origWord === '') {
                diff.push({ type: 'added', content: currWord })
                j++
            } else if (currWord === '') {
                diff.push({ type: 'removed', content: origWord })
                i++
            } else {
                // Check if we can find a match further ahead
                let found = false
                for (let k = j + 1; k < Math.min(j + 5, currentWords.length); k++) {
                    if (originalWords[i] === currentWords[k]) {
                        // Add all words between j and k as added
                        for (let l = j; l < k; l++) {
                            diff.push({ type: 'added', content: currentWords[l] })
                        }
                        j = k
                        found = true
                        break
                    }
                }

                if (!found) {
                    diff.push({ type: 'removed', content: origWord })
                    diff.push({ type: 'added', content: currWord })
                    i++
                    j++
                }
            }
        }

        return diff
    }

    const renderHtmlDiff = (original: string, current: string) => {
        const diff = createHtmlDiff(original, current)

        return (
            <div className="prose prose-sm max-w-none">
                {diff.map((item, index) => {
                    if (item.type === 'unchanged') {
                        return <span key={index}>{item.content}</span>
                    } else if (item.type === 'added') {
                        return (
                            <span key={index} className="bg-green-100 text-green-800 px-1 rounded">
                                {item.content}
                            </span>
                        )
                    } else if (item.type === 'removed') {
                        return (
                            <span key={index} className="bg-red-100 text-red-800 px-1 rounded line-through">
                                {item.content}
                            </span>
                        )
                    }
                    return null
                })}
            </div>
        )
    }

    const getDiffLines = (original: string, current: string) => {
        const originalLines = original.split('\n')
        const currentLines = current.split('\n')
        const maxLines = Math.max(originalLines.length, currentLines.length)
        const diffLines = []

        for (let i = 0; i < maxLines; i++) {
            const originalLine = originalLines[i] || ''
            const currentLine = currentLines[i] || ''

            if (originalLine === currentLine) {
                diffLines.push({
                    type: 'unchanged',
                    original: originalLine,
                    current: currentLine,
                    lineNumber: i + 1
                })
            } else if (originalLine === '') {
                diffLines.push({
                    type: 'added',
                    original: '',
                    current: currentLine,
                    lineNumber: i + 1
                })
            } else if (currentLine === '') {
                diffLines.push({
                    type: 'removed',
                    original: originalLine,
                    current: '',
                    lineNumber: i + 1
                })
            } else {
                diffLines.push({
                    type: 'modified',
                    original: originalLine,
                    current: currentLine,
                    lineNumber: i + 1
                })
            }
        }

        return diffLines
    }

    const diffLines = getDiffLines(originalContent, currentContent)

    const handleViewModeToggle = () => {
        const newMode = diffState.viewMode === 'clean' ? 'diff' : 'clean'
        onDiffStateChange?.({ ...diffState, viewMode: newMode })
    }

    return (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Changes Preview</h3>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleViewModeToggle}
                        className={`px-3 py-1 text-xs rounded ${diffState.viewMode === 'diff'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {diffState.viewMode === 'clean' ? 'Show Diff' : 'Show Clean'}
                    </button>
                    <button
                        onClick={() => setViewMode('side-by-side')}
                        className={`px-3 py-1 text-xs rounded ${viewMode === 'side-by-side'
                            ? 'bg-primary-100 text-primary-800'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Side by Side
                    </button>
                    <button
                        onClick={() => setViewMode('unified')}
                        className={`px-3 py-1 text-xs rounded ${viewMode === 'unified'
                            ? 'bg-primary-100 text-primary-800'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Unified
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {diffState.viewMode === 'clean' ? (
                    <div className="p-4">
                        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: currentContent }} />
                    </div>
                ) : viewMode === 'side-by-side' ? (
                    <div className="grid grid-cols-2">
                        <div className="border-r border-gray-200">
                            <div className="bg-red-50 px-3 py-2 text-xs font-medium text-red-800 border-b border-red-200">
                                Original
                            </div>
                            <div className="p-3">
                                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: originalContent }} />
                            </div>
                        </div>
                        <div>
                            <div className="bg-green-50 px-3 py-2 text-xs font-medium text-green-800 border-b border-green-200">
                                Modified
                            </div>
                            <div className="p-3">
                                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: currentContent }} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-3">
                        {renderHtmlDiff(originalContent, currentContent)}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2">
                    {onRestore && (
                        <button
                            onClick={onRestore}
                            className="px-4 py-2 text-sm bg-orange-200 text-orange-800 rounded hover:bg-orange-300 transition-colors"
                        >
                            Restore Original
                        </button>
                    )}
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onReject}
                        className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    >
                        Reject Changes
                    </button>
                    <button
                        onClick={onAccept}
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                        Accept Changes
                    </button>
                </div>
            </div>
        </div>
    )
}
