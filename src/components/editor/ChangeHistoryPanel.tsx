'use client'

import { useState, useEffect } from 'react'
import { ChangeEntry, DiffState } from '@/types/resume'
import { getRecentChanges, getSectionHistory } from '@/lib/history'

interface ChangeHistoryPanelProps {
    sectionId: string | null
    diffState: DiffState
    onDiffStateChange: (state: DiffState) => void
    onRestoreToChange?: (change: ChangeEntry) => void
}

export function ChangeHistoryPanel({
    sectionId,
    diffState,
    onDiffStateChange,
    onRestoreToChange
}: ChangeHistoryPanelProps) {
    const [changes, setChanges] = useState<ChangeEntry[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!sectionId) {
            setChanges([])
            return
        }

        setIsLoading(true)
        const recentChanges = getRecentChanges(sectionId, 10)
        setChanges(recentChanges)
        setIsLoading(false)
    }, [sectionId])

    const formatTimestamp = (timestamp: Date) => {
        const now = new Date()
        const diff = now.getTime() - timestamp.getTime()

        if (diff < 60000) { // Less than 1 minute
            return 'Just now'
        } else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000)
            return `${minutes}m ago`
        } else if (diff < 86400000) { // Less than 1 day
            const hours = Math.floor(diff / 3600000)
            return `${hours}h ago`
        } else {
            return timestamp.toLocaleDateString()
        }
    }

    const getActionIcon = (action: ChangeEntry['action']) => {
        switch (action) {
            case 'accept':
                return '✓'
            case 'reject':
                return '✗'
            case 'restore':
                return '↶'
            default:
                return '•'
        }
    }

    const getActionColor = (action: ChangeEntry['action']) => {
        switch (action) {
            case 'accept':
                return 'text-green-600 bg-green-50'
            case 'reject':
                return 'text-red-600 bg-red-50'
            case 'restore':
                return 'text-orange-600 bg-orange-50'
            default:
                return 'text-gray-600 bg-gray-50'
        }
    }

    const handleToggleHistory = () => {
        onDiffStateChange({ ...diffState, showHistory: !diffState.showHistory })
    }

    if (!sectionId) {
        return null
    }

    return (
        <div className="border-t border-gray-200 bg-gray-50">
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Change History</h3>
                    <button
                        onClick={handleToggleHistory}
                        className={`px-3 py-1 text-xs rounded ${diffState.showHistory
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {diffState.showHistory ? 'Hide History' : 'Show History'}
                    </button>
                </div>

                {diffState.showHistory && (
                    <div className="bg-white rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mx-auto mb-2"></div>
                                Loading history...
                            </div>
                        ) : changes.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No changes yet
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {changes.map((change) => (
                                    <div key={change.id} className="p-3 hover:bg-gray-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-2 flex-1">
                                                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium ${getActionColor(change.action)}`}>
                                                    {getActionIcon(change.action)}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs text-gray-600 mb-1">
                                                        {formatTimestamp(change.timestamp)}
                                                    </div>
                                                    {change.rationale && (
                                                        <div className="text-xs text-gray-700 mb-1">
                                                            {change.rationale}
                                                        </div>
                                                    )}
                                                    <div className="text-xs text-gray-500 truncate">
                                                        {change.action === 'accept' ? 'Applied changes' :
                                                            change.action === 'reject' ? 'Reverted changes' :
                                                                'Restored to original'}
                                                    </div>
                                                </div>
                                            </div>
                                            {onRestoreToChange && change.action === 'accept' && (
                                                <button
                                                    onClick={() => onRestoreToChange(change)}
                                                    className="ml-2 px-2 py-1 text-xs text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded"
                                                    title="Restore to this change"
                                                >
                                                    Restore
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
