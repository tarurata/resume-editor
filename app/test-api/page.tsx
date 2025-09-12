'use client'

import { useState } from 'react'
import { healthApi, resumeVersionApi, personalInfoApi } from '@/lib/api'
import { saveResumeToDatabase, loadResumeFromDatabase } from '@/lib/storage'
import { Resume } from '@/types/resume'

export default function TestApiPage() {
    const [results, setResults] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const addResult = (message: string) => {
        setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    }

    const clearResults = () => {
        setResults([])
    }

    const testHealthCheck = async () => {
        setLoading(true)
        try {
            const health = await healthApi.check()
            addResult(`✅ Health check passed: ${health.status}`)
        } catch (error) {
            addResult(`❌ Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setLoading(false)
        }
    }

    const testPersonalInfo = async () => {
        setLoading(true)
        try {
            // Try to get existing personal info
            let personalInfo = await personalInfoApi.get()

            if (!personalInfo) {
                // Create new personal info
                personalInfo = await personalInfoApi.create({
                    full_name: 'Test User',
                    email: 'test@example.com',
                    phone: '+1-555-0123',
                    location: 'Test City, TC'
                })
                addResult(`✅ Created personal info: ${personalInfo.full_name}`)
            } else {
                addResult(`✅ Found existing personal info: ${personalInfo.full_name}`)
            }
        } catch (error) {
            addResult(`❌ Personal info test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setLoading(false)
        }
    }

    const testResumeVersion = async () => {
        setLoading(true)
        try {
            const testResume: Resume = {
                title: 'Test Software Engineer',
                summary: 'This is a test resume for API testing purposes.',
                experience: [
                    {
                        role: 'Test Engineer',
                        organization: 'Test Company',
                        location: 'Test City',
                        startDate: '2023-01',
                        endDate: null,
                        bullets: [
                            'Tested API endpoints',
                            'Verified database integration'
                        ]
                    }
                ],
                skills: ['Testing', 'API Integration', 'Database']
            }

            // Create resume version
            const version = await resumeVersionApi.create(testResume, 'Test Company', 'Test Engineer')
            addResult(`✅ Created resume version: ${version.id}`)

            // Get active version
            const activeVersion = await resumeVersionApi.getActive()
            if (activeVersion) {
                addResult(`✅ Found active version: ${activeVersion.job_title}`)
            } else {
                addResult(`⚠️ No active version found`)
            }

            // Test storage functions
            await saveResumeToDatabase(testResume, 'Test Company', 'Test Engineer')
            addResult(`✅ Storage save test passed`)

            const loadedResume = await loadResumeFromDatabase()
            if (loadedResume) {
                addResult(`✅ Storage load test passed: ${loadedResume.title}`)
            } else {
                addResult(`⚠️ Storage load test returned null`)
            }

        } catch (error) {
            addResult(`❌ Resume version test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setLoading(false)
        }
    }

    const runAllTests = async () => {
        clearResults()
        addResult('🚀 Starting API integration tests...')

        await testHealthCheck()
        await testPersonalInfo()
        await testResumeVersion()

        addResult('✅ All tests completed!')
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">API Integration Test</h1>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
                    <div className="flex space-x-4 mb-4">
                        <button
                            onClick={testHealthCheck}
                            disabled={loading}
                            className="btn-secondary disabled:opacity-50"
                        >
                            Test Health Check
                        </button>
                        <button
                            onClick={testPersonalInfo}
                            disabled={loading}
                            className="btn-secondary disabled:opacity-50"
                        >
                            Test Personal Info
                        </button>
                        <button
                            onClick={testResumeVersion}
                            disabled={loading}
                            className="btn-secondary disabled:opacity-50"
                        >
                            Test Resume Version
                        </button>
                        <button
                            onClick={runAllTests}
                            disabled={loading}
                            className="btn-primary disabled:opacity-50"
                        >
                            Run All Tests
                        </button>
                        <button
                            onClick={clearResults}
                            className="btn-secondary"
                        >
                            Clear Results
                        </button>
                    </div>
                    {loading && (
                        <div className="text-blue-600">Running tests...</div>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Test Results</h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {results.length === 0 ? (
                            <p className="text-gray-500">No test results yet. Click a test button above to get started.</p>
                        ) : (
                            results.map((result, index) => (
                                <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                                    {result}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
