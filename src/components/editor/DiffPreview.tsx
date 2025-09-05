'use client'

import { useState } from 'react'

interface DiffPreviewProps {
    originalContent: string
    currentContent: string
    onAccept: () => void
    onReject: () => void
}

export function DiffPreview({ originalContent, currentContent, onAccept, onReject }: DiffPreviewProps) {
    const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side')

    if (originalContent === currentContent) {
        return null
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

    return (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Changes Preview</h3>
                <div className="flex items-center space-x-2">
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
                {viewMode === 'side-by-side' ? (
                    <div className="grid grid-cols-2">
                        <div className="border-r border-gray-200">
                            <div className="bg-red-50 px-3 py-2 text-xs font-medium text-red-800 border-b border-red-200">
                                Original
                            </div>
                            <div className="p-3">
                                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                                    {originalContent}
                                </pre>
                            </div>
                        </div>
                        <div>
                            <div className="bg-green-50 px-3 py-2 text-xs font-medium text-green-800 border-b border-green-200">
                                Modified
                            </div>
                            <div className="p-3">
                                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                                    {currentContent}
                                </pre>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-3">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                            {diffLines.map((line, index) => {
                                if (line.type === 'unchanged') {
                                    return `  ${line.lineNumber}: ${line.original}\n`
                                } else if (line.type === 'added') {
                                    return `+ ${line.lineNumber}: ${line.current}\n`
                                } else if (line.type === 'removed') {
                                    return `- ${line.lineNumber}: ${line.original}\n`
                                } else {
                                    return `~ ${line.lineNumber}: ${line.original} → ${line.current}\n`
                                }
                            }).join('')}
                        </pre>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-end space-x-3 mt-4">
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
    )
}
