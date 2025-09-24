'use client'

import { CertificationEntry } from '@/types/resume'
import { useState, useEffect } from 'react'

interface CertificationEditorProps {
    certification: CertificationEntry
    index: number
    onUpdate: (index: number, updatedCertification: CertificationEntry) => void
}

export function CertificationEditor({ certification, index, onUpdate }: CertificationEditorProps) {
    const [formData, setFormData] = useState<CertificationEntry>(certification)

    useEffect(() => {
        setFormData(certification)
    }, [certification])

    const handleChange = (field: keyof CertificationEntry, value: string) => {
        const updated = { ...formData, [field]: value }
        setFormData(updated)
        onUpdate(index, updated)
    }

    const formatDateForInput = (dateStr: string) => {
        if (!dateStr || dateStr.length < 7) return ''
        // Convert YYYY-MM to YYYY-MM for month input
        return dateStr.substring(0, 7)
    }

    const formatDateFromInput = (inputValue: string) => {
        if (!inputValue) return ''
        // Month input already returns YYYY-MM format
        return inputValue
    }

    return (
        <div className="h-full overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Edit Certification</h2>
                    <p className="text-gray-600">Update the certification details below.</p>
                </div>

                <div className="space-y-6">
                    {/* Certification Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Certification Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="e.g., AWS Certified Solutions Architect"
                        />
                    </div>

                    {/* Issuer */}
                    <div>
                        <label htmlFor="issuer" className="block text-sm font-medium text-gray-700 mb-2">
                            Issuing Organization *
                        </label>
                        <input
                            type="text"
                            id="issuer"
                            value={formData.issuer}
                            onChange={(e) => handleChange('issuer', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="e.g., Amazon Web Services"
                        />
                    </div>

                    {/* Issue Date */}
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                            Issue Date *
                        </label>
                        <input
                            type="month"
                            id="date"
                            value={formatDateForInput(formData.date)}
                            onChange={(e) => handleChange('date', formatDateFromInput(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    {/* Preview */}
                    <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <div className="font-medium text-gray-900">{formData.name || 'Certification Name'}</div>
                            <div className="text-sm text-gray-600">{formData.issuer || 'Issuing Organization'}</div>
                            <div className="text-sm text-gray-500">
                                {formData.date ? (() => {
                                    const [year, month] = formData.date.split('-')
                                    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
                                    return date.toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long'
                                    })
                                })() : 'Issue Date'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
