'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { URLParams, URLState, parseURLParams, paramsToState, stateToSearchParams, validateURLParams } from '@/lib/urlUtils'
import { SectionId } from '@/types/resume'

interface URLStateManagerProps {
    resumeId: string
    currentState: URLState
    onStateChange: (newState: URLState) => void
    onError: (error: string) => void
}

export function URLStateManager({
    resumeId,
    currentState,
    onStateChange,
    onError
}: URLStateManagerProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const isUpdatingURL = useRef(false)
    const lastStateRef = useRef<URLState>(currentState)

    // Parse initial URL parameters on mount
    useEffect(() => {
        const urlParams = parseURLParams(searchParams)
        const validation = validateURLParams(urlParams)

        if (!validation.valid) {
            console.warn('Invalid URL parameters:', validation.errors)
            onError(`Invalid URL parameters: ${validation.errors.join(', ')}`)
        }

        const initialState = paramsToState(urlParams)
        onStateChange(initialState)
        lastStateRef.current = initialState
    }, [searchParams, onStateChange, onError])

    // Update URL when state changes (but not when we're updating from URL)
    const updateURL = useCallback((newState: URLState) => {
        if (isUpdatingURL.current) return

        const searchParams = stateToSearchParams(newState)
        const queryString = searchParams.toString()
        const newUrl = queryString
            ? `/editor/${resumeId}?${queryString}`
            : `/editor/${resumeId}`

        // Use replaceState to avoid adding to browser history for programmatic changes
        router.replace(newUrl, { scroll: false })
        lastStateRef.current = newState
    }, [router, resumeId])

    // Expose method to update state and URL
    const updateState = useCallback((newState: Partial<URLState>) => {
        const updatedState = { ...currentState, ...newState }
        onStateChange(updatedState)
        updateURL(updatedState)
    }, [currentState, onStateChange, updateURL])

    // Handle browser back/forward navigation
    useEffect(() => {
        const handlePopState = () => {
            isUpdatingURL.current = true
            const urlParams = parseURLParams(searchParams)
            const newState = paramsToState(urlParams)

            // Only update if state actually changed
            if (JSON.stringify(newState) !== JSON.stringify(lastStateRef.current)) {
                onStateChange(newState)
                lastStateRef.current = newState
            }
            isUpdatingURL.current = false
        }

        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [searchParams, onStateChange])

    // Update URL when currentState changes externally
    useEffect(() => {
        if (JSON.stringify(currentState) !== JSON.stringify(lastStateRef.current)) {
            updateURL(currentState)
        }
    }, [currentState, updateURL])

    // Expose methods for parent component
    useEffect(() => {
        // Store updateState method on window for debugging/development
        if (typeof window !== 'undefined') {
            (window as any).urlStateManager = {
                updateState,
                currentState,
                updateURL
            }
        }
    }, [updateState, currentState, updateURL])

    return null // This component doesn't render anything
}

/**
 * Hook to use URL state management
 */
export function useURLState(resumeId: string) {
    const [urlState, setUrlState] = useState<URLState>({
        section: null,
        mode: 'edit',
        jd: null
    })
    const [urlError, setUrlError] = useState<string | null>(null)

    const updateURLState = useCallback((newState: URLState) => {
        setUrlState(newState)
    }, [])

    const handleURLError = useCallback((error: string) => {
        setUrlError(error)
        console.error('URL State Error:', error)
    }, [])

    return {
        urlState,
        urlError,
        updateURLState,
        handleURLError
    }
}
