'use client'

import { useEffect, useState } from 'react'

export function MSWProvider({ children }: { children: React.ReactNode }) {
    const [mswReady, setMswReady] = useState(false)

    useEffect(() => {
        // For now, skip MSW initialization to focus on core functionality
        // MSW can be enabled later when needed
        setMswReady(true)

        // Uncomment below to enable MSW in development
        /*
        if (process.env.NODE_ENV === 'development') {
            // Set a timeout to prevent hanging
            const timeout = setTimeout(() => {
                console.warn('MSW initialization timeout, continuing without MSW')
                setMswReady(true)
            }, 3000)

            import('../mocks/browser').then(({ worker }) => {
                worker.start().then(() => {
                    clearTimeout(timeout)
                    setMswReady(true)
                }).catch((error) => {
                    clearTimeout(timeout)
                    console.warn('MSW failed to start:', error)
                    setMswReady(true) // Continue without MSW
                })
            }).catch((error) => {
                clearTimeout(timeout)
                console.warn('Failed to load MSW:', error)
                setMswReady(true) // Continue without MSW
            })
        } else {
            setMswReady(true)
        }
        */
    }, [])

    if (!mswReady) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Initializing editor...</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
