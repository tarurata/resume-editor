import { Resume } from '@/types/resume'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

// API Response Types
interface ApiResponse<T> {
    data?: T
    error?: string
    status: number
}

interface ResumeVersion {
    id: string
    user_id: string
    company_name: string
    company_email: string
    company_url?: string
    job_title: string
    job_description?: string
    resume_data: Resume
    is_active: boolean
    created_at: string
    updated_at: string
}

interface PersonalInfo {
    user_id: string
    full_name: string
    email: string
    phone?: string
    location?: string
    linkedin_url?: string
    portfolio_url?: string
}

// API Error class
export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public response?: any
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

// Generic API request function
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`

    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
    }

    // Retrieve JWT token  from localStorage
    if (typeof window !== 'undefined') { // Ensure localStorage is only accessed on the client side
        const token = localStorage.getItem('jwt_Token')
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`
        }
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        })

        // Parse JSON response, but handle empty bodies (like 204 No Content)
        let data = null
        if (response.status !== 204) {
            try {
                data = await response.json()
            } catch {
                // Empty or invalid JSON body - that's fine
            }
        }

        if (!response.ok) {
            const errorMessage = data?.detail || `HTTP ${response.status}: ${response.statusText}`
            throw new ApiError(errorMessage, response.status, data)
        }

        return {
            data,
            status: response.status,
        }
    } catch (error) {
        if (error instanceof ApiError) {
            throw error
        }

        // Network or other errors
        throw new ApiError(
            error instanceof Error ? error.message : 'Network error',
            0
        )
    }
}

// Resume Version API functions
export const resumeVersionApi = {
    // Create a new resume version
    async create(resumeData: Resume, companyName: string, jobTitle: string, companyEmail?: string, companyUrl?: string, jobDescription?: string): Promise<ResumeVersion> {
        const response = await apiRequest<ResumeVersion>(
            `/resume-versions/`,
            {
                method: 'POST',
                body: JSON.stringify({
                    company_name: companyName,
                    company_email: companyEmail || '',
                    company_url: companyUrl || '',
                    job_title: jobTitle,
                    job_description: jobDescription,
                    resume_data: resumeData,
                    is_active: true
                }),
            }
        )

        if (!response.data) {
            throw new ApiError('Failed to create resume version', response.status)
        }

        return response.data
    },

    // Get all resume versions for user
    async getAll(userId?: string): Promise<ResumeVersion[]> {
        const endpoint = userId ? `/resume-versions/user/${userId}` : `/resume-versions/`
        const response = await apiRequest<ResumeVersion[]>(endpoint)

        if (!response.data) {
            throw new ApiError('Failed to fetch resume versions', response.status)
        }

        return response.data
    },

    // Get specific resume version
    async getById(versionId: string, userId?: string): Promise<ResumeVersion> {
        const endpoint = userId ? `/resume-versions/user/${userId}/${versionId}` : `/resume-versions/${versionId}`
        const response = await apiRequest<ResumeVersion>(endpoint)

        if (!response.data) {
            throw new ApiError('Failed to fetch resume version', response.status)
        }

        return response.data
    },

    // Get active resume version
    async getActive(): Promise<ResumeVersion | null> {
        try {
            const response = await apiRequest<ResumeVersion>(`/resume-versions/user/active`)
            return response.data || null
        } catch (error) {
            if (error instanceof ApiError && error.status === 404) {
                return null
            }
            throw error
        }
    },

    // Update resume version
    async update(versionId: string, updates: Partial<ResumeVersion>): Promise<ResumeVersion> {
        const response = await apiRequest<ResumeVersion>(
            `/resume-versions/${versionId}`,
            {
                method: 'PUT',
                body: JSON.stringify(updates),
            }
        )

        if (!response.data) {
            throw new ApiError('Failed to update resume version', response.status)
        }

        return response.data
    },

    // Set active resume version
    async setActive(versionId: string): Promise<ResumeVersion> {
        const response = await apiRequest<ResumeVersion>(
            `/resume-versions/${versionId}/activate`,
            {
                method: 'POST',
            }
        )

        if (!response.data) {
            throw new ApiError('Failed to set active resume version', response.status)
        }

        return response.data
    },

    // Delete resume version
    async delete(versionId: string): Promise<void> {
        await apiRequest(`/resume-versions/${versionId}`, {
            method: 'DELETE',
        })
    },

    // Copy experiences from one resume version to another
    async copyExperiences(targetVersionId: string, sourceVersionId: string): Promise<{ message: string; copied_count: number; success: boolean }> {
        const response = await apiRequest<{ message: string; copied_count: number; success: boolean }>(
            `/resume-versions/${targetVersionId}/copy-experiences?source_version_id=${sourceVersionId}`,
            {
                method: 'POST',
            }
        )

        if (!response.data) {
            throw new ApiError('Failed to copy experiences', response.status)
        }

        return response.data
    }
}

// Personal Info API functions
export const personalInfoApi = {
    // Create personal info
    async create(personalInfo: Omit<PersonalInfo, 'user_id' | 'id'>): Promise<PersonalInfo> {
        const response = await apiRequest<PersonalInfo>(
            '/personal-info/',
            {
                method: 'POST',
                body: JSON.stringify({
                    ...personalInfo,
                }),
            }
        )

        if (!response.data) {
            throw new ApiError('Failed to create personal info', response.status)
        }

        return response.data
    },

    // Get personal info
    async get(): Promise<PersonalInfo | null> {
        try {
            const response = await apiRequest<PersonalInfo>(`/personal-info/`)
            return response.data || null
        } catch (error) {
            if (error instanceof ApiError && error.status === 404) {
                return null
            }
            throw error
        }
    },

    // Update personal info
    async update(updates: Partial<Omit<PersonalInfo, 'user_id'>>): Promise<PersonalInfo> {
        const response = await apiRequest<PersonalInfo>(
            `/personal-info/`,
            {
                method: 'PUT',
                body: JSON.stringify(updates),
            }
        )

        if (!response.data) {
            throw new ApiError('Failed to update personal info', response.status)
        }

        return response.data
    },

    // Delete personal info
    async delete(): Promise<void> {
        await apiRequest(`/personal-info/`, {
            method: 'DELETE',
        })
    }
}

// PDF Export API functions
export const pdfExportApi = {
    // Export resume to PDF using server-side rendering
    async exportResumeToPDF(resume: Resume): Promise<Blob> {
        const url = `${API_BASE_URL}/export/pdf`

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resume),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                const errorMessage = errorData.detail?.message || `HTTP ${response.status}: ${response.statusText}`
                throw new ApiError(errorMessage, response.status, errorData)
            }

            return await response.blob()
        } catch (error) {
            if (error instanceof ApiError) {
                throw error
            }
            throw new ApiError(
                error instanceof Error ? error.message : 'PDF export failed',
                0
            )
        }
    },

    // Export HTML content to PDF
    async exportHTMLToPDF(htmlContent: string, filename?: string, themeOptions?: any): Promise<Blob> {
        const url = `${API_BASE_URL}/export/pdf-from-html`

        try {
            const defaultHeaders: HeadersInit = {
                'Content-Type': 'application/json',
            }

            if (typeof window  !== 'undefined') {
                const token = localStorage.getItem('jwt_Token')
                if (token) {
                    defaultHeaders['Authorization'] = `Bearer ${token}`
                }
            } // Moved closing brace here
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    ...defaultHeaders,
                },
                body: JSON.stringify({
                    html_content: htmlContent,
                    filename: filename || 'document.pdf',
                    theme_options: themeOptions || {}
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                const errorMessage = errorData.detail?.message || `HTTP ${response.status}: ${response.statusText}`
                throw new ApiError(errorMessage, response.status, errorData)
            }

            return await response.blob()
        } catch (error) {
            if (error instanceof ApiError) {
                throw error
            }
            throw new ApiError(
                error instanceof Error ? error.message : 'HTML to PDF export failed',
                0
            )
        }
    },

    // Download PDF blob as file
    downloadPDF(blob: Blob, filename: string): void {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    }
}

// Health check
export const healthApi = {
    async check(): Promise<{ status: string; timestamp: string }> {
        const response = await apiRequest<{ status: string; timestamp: string }>('/health')

        if (!response.data) {
            throw new ApiError('Health check failed', response.status)
        }

        return response.data
    }
}
