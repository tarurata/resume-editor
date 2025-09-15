'use client'

import { Resume, PersonalInfo } from '@/types/resume'
import { useEffect, useCallback, useState } from 'react'
import { pdfExportApi, personalInfoApi, ApiError } from '@/lib/api'
import { LatexStyleResume } from './LatexStyleResume'

interface PrintViewProps {
    resume: Resume
    onClose: () => void
}

export function PrintView({ resume, onClose }: PrintViewProps) {
    const [isExporting, setIsExporting] = useState(false)
    const [exportError, setExportError] = useState<string | null>(null)
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null)
    const [isLoadingPersonalInfo, setIsLoadingPersonalInfo] = useState(true)

    // Load personal information
    useEffect(() => {
        const loadPersonalInfo = async () => {
            try {
                const existingInfo = await personalInfoApi.get()
                if (existingInfo) {
                    setPersonalInfo({
                        name: existingInfo.full_name || '',
                        email: existingInfo.email || '',
                        phone: existingInfo.phone || '',
                        linkedin: existingInfo.linkedin_url || '',
                        github: existingInfo.portfolio_url || ''
                    })
                }
            } catch (error) {
                console.warn('Failed to load personal information:', error)
            } finally {
                setIsLoadingPersonalInfo(false)
            }
        }

        loadPersonalInfo()
    }, [])

    const handlePrint = useCallback(() => {
        // Ensure the print dialog opens with proper settings
        setTimeout(() => {
            window.print()
        }, 100)
    }, [])

    const handleBrowserPDFExport = useCallback(async () => {
        setIsExporting(true)
        setExportError(null)

        try {
            // Create a temporary container to render the LaTeX-style resume
            const tempContainer = document.createElement('div')
            tempContainer.style.position = 'absolute'
            tempContainer.style.left = '-9999px'
            tempContainer.style.top = '-9999px'
            document.body.appendChild(tempContainer)

            // Render the LaTeX-style resume in the temporary container
            const { createRoot } = await import('react-dom/client')
            const root = createRoot(tempContainer)
            root.render(<LatexStyleResume resume={resume} personalInfo={personalInfo} />)

            // Wait for rendering to complete
            await new Promise(resolve => setTimeout(resolve, 100))

            // Get the rendered HTML
            const latexResumeElement = tempContainer.querySelector('.latex-resume')
            if (!latexResumeElement) {
                throw new Error('Failed to render resume content')
            }

            // Create a new window with the LaTeX-style resume
            const printWindow = window.open('', '_blank')
            if (!printWindow) {
                throw new Error('Could not open print window. Please check your popup blocker settings.')
            }

            // Generate HTML content with LaTeX styling
            const htmlContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${resume.title} - Resume</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: 'Times New Roman', serif;
                            font-size: 11pt;
                            line-height: 1.2;
                            color: #000;
                            background: white;
                            max-width: 8.5in;
                            margin: 0 auto;
                            padding: 0.5in;
                        }
                        
                        .latex-resume {
                            font-family: 'Times New Roman', serif;
                            font-size: 11pt;
                            line-height: 1.2;
                            color: #000;
                            max-width: 8.5in;
                            margin: 0 auto;
                            padding: 0.5in;
                            background: white;
                        }
                        
                        .resume-header {
                            text-align: center;
                            margin-bottom: 20pt;
                        }
                        
                        .resume-name {
                            font-size: 24pt;
                            font-weight: bold;
                            text-transform: uppercase;
                            letter-spacing: 1pt;
                            margin-bottom: 5pt;
                        }
                        
                        .resume-title {
                            font-size: 14pt;
                            font-weight: bold;
                            margin-bottom: 5pt;
                        }
                        
                        .contact-info {
                            font-size: 10pt;
                            margin-bottom: 10pt;
                        }
                        
                        .contact-info a {
                            color: #000;
                            text-decoration: underline;
                        }
                        
                        .section {
                            margin-bottom: 16pt;
                        }
                        
                        .section-title {
                            font-size: 12pt;
                            font-weight: bold;
                            text-transform: uppercase;
                            letter-spacing: 0.5pt;
                            margin-bottom: 8pt;
                            padding-bottom: 2pt;
                            border-bottom: 1pt solid #000;
                        }
                        
                        .summary-text {
                            font-size: 11pt;
                            line-height: 1.4;
                            text-align: justify;
                        }
                        
                        .experience-item {
                            margin-bottom: 12pt;
                        }
                        
                        .experience-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-start;
                            margin-bottom: 4pt;
                        }
                        
                        .experience-role {
                            font-weight: bold;
                            font-size: 11pt;
                        }
                        
                        .experience-org {
                            font-style: italic;
                            font-size: 10pt;
                        }
                        
                        .experience-location {
                            font-style: italic;
                            font-size: 10pt;
                        }
                        
                        .experience-dates {
                            font-style: italic;
                            font-size: 10pt;
                            text-align: right;
                            white-space: nowrap;
                        }
                        
                        .experience-bullets {
                            margin: 4pt 0 0 0;
                            padding-left: 0;
                            list-style: none;
                        }
                        
                        .experience-bullets li {
                            position: relative;
                            padding-left: 12pt;
                            margin-bottom: 2pt;
                            font-size: 10pt;
                            line-height: 1.3;
                        }
                        
                        .experience-bullets li::before {
                            content: "•";
                            position: absolute;
                            left: 0;
                            font-weight: bold;
                        }
                        
                        .education-item {
                            margin-bottom: 8pt;
                        }
                        
                        .education-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-start;
                            margin-bottom: 2pt;
                        }
                        
                        .education-degree {
                            font-weight: bold;
                            font-size: 11pt;
                        }
                        
                        .education-school {
                            font-style: italic;
                            font-size: 10pt;
                        }
                        
                        .education-location {
                            font-style: italic;
                            font-size: 10pt;
                        }
                        
                        .education-dates {
                            font-style: italic;
                            font-size: 10pt;
                            text-align: right;
                        }
                        
                        .certifications-item {
                            margin-bottom: 6pt;
                        }
                        
                        .certifications-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-start;
                            margin-bottom: 2pt;
                        }
                        
                        .certification-name {
                            font-weight: bold;
                            font-size: 11pt;
                        }
                        
                        .certification-issuer {
                            font-style: italic;
                            font-size: 10pt;
                        }
                        
                        .certification-date {
                            font-style: italic;
                            font-size: 10pt;
                            text-align: right;
                        }
                        
                        .skills-container {
                            display: flex;
                            flex-wrap: wrap;
                            gap: 8pt;
                        }
                        
                        .skill-category {
                            margin-bottom: 8pt;
                        }
                        
                        .skill-category-title {
                            font-weight: bold;
                            font-size: 10pt;
                            margin-bottom: 2pt;
                        }
                        
                        .skill-list {
                            font-size: 10pt;
                            line-height: 1.3;
                        }
                        
                        @page {
                            size: letter;
                            margin: 0.5in;
                        }
                        
                        @media print {
                            body {
                                -webkit-print-color-adjust: exact;
                                color-adjust: exact;
                                print-color-adjust: exact;
                            }
                            
                            .page-break-before {
                                page-break-before: always;
                            }
                            
                            .page-break-after {
                                page-break-after: always;
                            }
                            
                            .page-break-inside-avoid {
                                page-break-inside: avoid;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${latexResumeElement.outerHTML}
                </body>
                </html>
            `

            printWindow.document.write(htmlContent)
            printWindow.document.close()

            // Clean up temporary container
            root.unmount()
            document.body.removeChild(tempContainer)

            // Wait for content to load, then trigger print
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print()
                    // Close the window after printing
                    setTimeout(() => {
                        printWindow.close()
                    }, 1000)
                }, 500)
            }

        } catch (error) {
            console.error('Browser PDF export failed:', error)
            setExportError(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setIsExporting(false)
        }
    }, [resume])

    const handleServerSideExport = useCallback(async () => {
        setIsExporting(true)
        setExportError(null)

        try {
            // Export using server-side PDF generation
            const pdfBlob = await pdfExportApi.exportResumeToPDF(resume)

            // Generate filename from resume title
            const filename = `${resume.title.replace(/\s+/g, '_').toLowerCase()}_resume.pdf`

            // Download the PDF
            pdfExportApi.downloadPDF(pdfBlob, filename)

        } catch (error) {
            console.error('PDF export failed:', error)

            if (error instanceof ApiError) {
                setExportError(`Export failed: ${error.message}`)
            } else {
                setExportError('Export failed. Please try again or use the browser print function.')
            }
        } finally {
            setIsExporting(false)
        }
    }, [resume])

    useEffect(() => {
        // Add print-specific styles when component mounts
        const style = document.createElement('style')
        style.textContent = `
            @media print {
                body * {
                    visibility: hidden;
                }
                .print-resume, .print-resume * {
                    visibility: visible;
                }
                .print-resume {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
                .no-print {
                    display: none !important;
                }
                /* Ensure proper page breaks */
                .page-break-before {
                    page-break-before: always;
                }
                .page-break-after {
                    page-break-after: always;
                }
                .page-break-inside-avoid {
                    page-break-inside: avoid;
                    break-inside: avoid;
                }
            }
        `
        document.head.appendChild(style)

        // Add keyboard shortcut for print (Ctrl/Cmd + P)
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault()
                handlePrint()
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            if (document.head.contains(style)) {
                document.head.removeChild(style)
            }
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [handlePrint])

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Present'
        const date = new Date(dateStr + '-01')
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        })
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 no-print">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Resume Preview</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Use "Server PDF" for consistent output or "Browser PDF" for quick export
                        </p>
                        {exportError && (
                            <p className="text-sm text-red-600 mt-1">
                                {exportError}
                            </p>
                        )}
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleServerSideExport}
                            disabled={isExporting}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isExporting ? 'Generating...' : 'Server PDF'}
                        </button>
                        <button
                            onClick={handleBrowserPDFExport}
                            disabled={isExporting}
                            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isExporting ? 'Generating...' : 'Browser PDF'}
                        </button>
                        <button
                            onClick={handlePrint}
                            className="btn-secondary"
                        >
                            Print Preview
                        </button>
                        <button
                            onClick={onClose}
                            className="btn-secondary"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Print Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    <div className="print-resume max-w-4xl mx-auto">
                        <LatexStyleResume resume={resume} personalInfo={personalInfo} />
                    </div>
                </div>
            </div>
        </div>
    )
}
