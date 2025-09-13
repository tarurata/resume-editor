'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ResumeService } from '@/lib/resumeService'

export default function EditorPage() {
    const router = useRouter()

    useEffect(() => {
        const redirectToResume = async () => {
            try {
                // Try to get the active resume first
                const activeResume = await ResumeService.getActiveResume()

                if (activeResume) {
                    // Redirect to the active resume editor
                    router.push(`/editor/${activeResume.id}`)
                } else {
                    // If no active resume, get all resumes and redirect to the most recent one
                    const resumes = await ResumeService.getResumes()

                    if (resumes.length > 0) {
                        // Redirect to the most recent resume
                        router.push(`/editor/${resumes[0].id}`)
                    } else {
                        // No resumes exist, redirect to create new resume
                        router.push('/resumes/new')
                    }
                }
            } catch (error) {
                console.error('Error determining resume to edit:', error)
                // Fallback to create new resume
                router.push('/resumes/new')
            }
        }

        redirectToResume()
    }, [router])

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Redirecting to resume editor...</p>
            </div>
        </div>
    )
}