import { ChangeEntry, SectionHistory } from '@/types/resume'

const HISTORY_STORAGE_KEY = 'resume-editor-history'

export function loadHistoryFromStorage(): Record<string, SectionHistory> {
    if (typeof window === 'undefined') return {}

    try {
        const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
        if (!stored) return {}

        const parsed = JSON.parse(stored)
        // Convert timestamp strings back to Date objects
        Object.values(parsed).forEach((section: any) => {
            if (section.changes) {
                section.changes = section.changes.map((change: any) => ({
                    ...change,
                    timestamp: new Date(change.timestamp)
                }))
            }
        })

        return parsed
    } catch (error) {
        console.error('Failed to load history from storage:', error)
        return {}
    }
}

export function saveHistoryToStorage(history: Record<string, SectionHistory>): void {
    if (typeof window === 'undefined') return

    try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
    } catch (error) {
        console.error('Failed to save history to storage:', error)
    }
}

export function addChangeToHistory(
    sectionId: string,
    originalContent: string,
    newContent: string,
    action: 'accept' | 'reject' | 'restore',
    rationale?: string
): ChangeEntry {
    const change: ChangeEntry = {
        id: `${sectionId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        sectionId,
        originalContent,
        newContent,
        rationale,
        action
    }

    const history = loadHistoryFromStorage()

    if (!history[sectionId]) {
        history[sectionId] = {
            sectionId,
            changes: [],
            originalContent,
            currentContent: originalContent
        }
    }

    history[sectionId].changes.push(change)
    history[sectionId].currentContent = newContent

    // Keep only the last 10 changes per section
    if (history[sectionId].changes.length > 10) {
        history[sectionId].changes = history[sectionId].changes.slice(-10)
    }

    saveHistoryToStorage(history)
    return change
}

export function getSectionHistory(sectionId: string): SectionHistory | null {
    const history = loadHistoryFromStorage()
    return history[sectionId] || null
}

export function getRecentChanges(sectionId: string, limit: number = 3): ChangeEntry[] {
    const sectionHistory = getSectionHistory(sectionId)
    if (!sectionHistory) return []

    return sectionHistory.changes
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit)
}

export function clearSectionHistory(sectionId: string): void {
    const history = loadHistoryFromStorage()
    delete history[sectionId]
    saveHistoryToStorage(history)
}

export function clearAllHistory(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(HISTORY_STORAGE_KEY)
}
