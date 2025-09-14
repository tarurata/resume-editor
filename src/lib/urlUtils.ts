import { SectionId } from '@/types/resume'

export interface URLParams {
    section?: SectionId
    mode?: 'print' | 'edit'
    jd?: string
}

export interface URLState {
    section: SectionId | null
    mode: 'print' | 'edit'
    jd: string | null
}

/**
 * Parse URL search parameters into structured URLParams
 */
export function parseURLParams(searchParams: URLSearchParams): URLParams {
    const params: URLParams = {}

    const section = searchParams.get('section')
    if (section) {
        params.section = section as SectionId
    }

    const mode = searchParams.get('mode')
    if (mode === 'print' || mode === 'edit') {
        params.mode = mode
    }

    const jd = searchParams.get('jd')
    if (jd) {
        params.jd = jd
    }

    return params
}

/**
 * Convert URLParams to URLState with defaults
 */
export function paramsToState(params: URLParams): URLState {
    return {
        section: params.section || null,
        mode: params.mode || 'edit',
        jd: params.jd || null
    }
}

/**
 * Create URL search parameters from URLState
 */
export function stateToSearchParams(state: URLState): URLSearchParams {
    const searchParams = new URLSearchParams()

    if (state.section) {
        searchParams.set('section', state.section)
    }

    if (state.mode !== 'edit') {
        searchParams.set('mode', state.mode)
    }

    if (state.jd) {
        searchParams.set('jd', state.jd)
    }

    return searchParams
}

/**
 * Validate URL parameters
 */
export function validateURLParams(params: URLParams): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (params.section) {
        // Validate section ID format
        const validSections = ['title', 'summary', 'skills']
        const isExperienceSection = params.section.startsWith('experience-')
        const isExperienceIndex = isExperienceSection && /^experience-\d+$/.test(params.section)

        if (!validSections.includes(params.section) && !isExperienceIndex) {
            errors.push(`Invalid section ID: ${params.section}`)
        }
    }

    if (params.mode && !['print', 'edit'].includes(params.mode)) {
        errors.push(`Invalid mode: ${params.mode}. Must be 'print' or 'edit'`)
    }

    if (params.jd && params.jd.length > 1000) {
        errors.push('Job description parameter too long (max 1000 characters)')
    }

    return {
        valid: errors.length === 0,
        errors
    }
}

/**
 * Create a deep link URL for sharing
 */
export function createDeepLink(
    baseUrl: string,
    resumeId: string,
    state: URLState
): string {
    const searchParams = stateToSearchParams(state)
    const queryString = searchParams.toString()

    return queryString
        ? `${baseUrl}/editor/${resumeId}?${queryString}`
        : `${baseUrl}/editor/${resumeId}`
}

/**
 * Check if URL parameters have changed
 */
export function hasURLParamsChanged(
    currentParams: URLParams,
    newParams: URLParams
): boolean {
    return (
        currentParams.section !== newParams.section ||
        currentParams.mode !== newParams.mode ||
        currentParams.jd !== newParams.jd
    )
}

/**
 * Get section display name for navigation
 */
export function getSectionDisplayName(sectionId: SectionId): string {
    if (sectionId === 'title') return 'Title'
    if (sectionId === 'summary') return 'Summary'
    if (sectionId === 'skills') return 'Skills'
    if (sectionId.startsWith('experience-')) {
        const index = sectionId.split('-')[1]
        return `Experience ${parseInt(index) + 1}`
    }
    return sectionId
}

/**
 * Get all available sections for a resume
 */
export function getAvailableSections(resume: any): SectionId[] {
    const sections: SectionId[] = ['title', 'summary', 'skills']

    if (resume.experience && resume.experience.length > 0) {
        for (let i = 0; i < resume.experience.length; i++) {
            sections.push(`experience-${i}`)
        }
    }

    return sections
}
