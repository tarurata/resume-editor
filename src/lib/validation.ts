import { Resume } from '@/types/resume'

// Validation error interface
export interface ValidationError {
    field: string
    message: string
}

// Resume validation function
export function validateResumeData(resume: Resume): ValidationError[] {
    const errors: ValidationError[] = []

    // Validate title
    if (!resume.title || resume.title.trim().length === 0) {
        errors.push({
            field: 'title',
            message: 'Title is required'
        })
    } else if (resume.title.length > 200) {
        errors.push({
            field: 'title',
            message: 'Title must be less than 200 characters'
        })
    }

    // Validate summary
    if (!resume.summary || resume.summary.trim().length === 0) {
        errors.push({
            field: 'summary',
            message: 'Summary is required'
        })
    } else if (resume.summary.length > 1000) {
        errors.push({
            field: 'summary',
            message: 'Summary must be less than 1000 characters'
        })
    }

    // Validate experience
    if (resume.experience && resume.experience.length > 0) {
        resume.experience.forEach((exp, index) => {
            // Check if this is a complete experience (has role and organization)
            const isCompleteExperience = exp.role && exp.role.trim().length > 0 &&
                exp.organization && exp.organization.trim().length > 0

            if (!exp.role || exp.role.trim().length === 0) {
                errors.push({
                    field: `experience[${index}].role`,
                    message: 'Job role is required'
                })
            }

            if (!exp.organization || exp.organization.trim().length === 0) {
                errors.push({
                    field: `experience[${index}].organization`,
                    message: 'Organization is required'
                })
            }

            // Only validate dates for complete experiences
            if (isCompleteExperience) {
                if (!exp.startDate || !isValidDateFormat(exp.startDate)) {
                    errors.push({
                        field: `experience[${index}].startDate`,
                        message: 'Start date must be in YYYY-MM format'
                    })
                }

                if (exp.endDate && !isValidDateFormat(exp.endDate)) {
                    errors.push({
                        field: `experience[${index}].endDate`,
                        message: 'End date must be in YYYY-MM format or null'
                    })
                }

                if (exp.bullets && exp.bullets.length > 0) {
                    exp.bullets.forEach((bullet, bulletIndex) => {
                        if (!bullet || bullet.trim().length === 0) {
                            errors.push({
                                field: `experience[${index}].bullets[${bulletIndex}]`,
                                message: 'Bullet point cannot be empty'
                            })
                        } else if (bullet.length > 500) {
                            errors.push({
                                field: `experience[${index}].bullets[${bulletIndex}]`,
                                message: 'Bullet point must be less than 500 characters'
                            })
                        }
                    })
                }
            }
        })
    }

    // Validate skills
    if (resume.skills && resume.skills.length > 0) {
        resume.skills.forEach((skill, index) => {
            const skillText = typeof skill === 'string' ? skill : skill.category
            if (!skillText || skillText.trim().length === 0) {
                errors.push({
                    field: `skills[${index}]`,
                    message: 'Skill cannot be empty'
                })
            } else if (skillText.length > 100) {
                errors.push({
                    field: `skills[${index}]`,
                    message: 'Skill must be less than 100 characters'
                })
            }
        })
    }

    return errors
}

// Validate date format (YYYY-MM)
function isValidDateFormat(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}$/
    if (!dateRegex.test(date)) {
        return false
    }

    const [year, month] = date.split('-').map(Number)
    return year >= 1900 && year <= 2100 && month >= 1 && month <= 12
}

// Validate resume data for API compatibility
export function validateResumeForApi(resume: Resume): { isValid: boolean; errors: ValidationError[] } {
    const errors = validateResumeData(resume)

    // Additional API-specific validations
    if (errors.length === 0) {
        // Check minimum requirements for API
        const hasTitleOrSummary = resume.title && resume.summary
        const hasExperienceOrSkills = (resume.experience && resume.experience.length > 0) ||
            (resume.skills && resume.skills.length > 0)

        if (!hasTitleOrSummary) {
            errors.push({
                field: 'resume',
                message: 'Resume must have both title and summary'
            })
        }

        if (!hasExperienceOrSkills) {
            errors.push({
                field: 'resume',
                message: 'Resume must have either experience or skills'
            })
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

// Sanitize resume data for API
export function sanitizeResumeForApi(resume: Resume): Resume {
    return {
        title: resume.title?.trim() || '',
        summary: resume.summary?.trim() || '',
        experience: resume.experience?.map(exp => ({
            role: exp.role?.trim() || '',
            organization: exp.organization?.trim() || '',
            location: exp.location?.trim(),
            startDate: exp.startDate || '',
            endDate: exp.endDate,
            bullets: exp.bullets?.map(bullet => bullet?.trim()).filter(bullet => bullet.length > 0) || []
        })) || [],
        education: resume.education?.map(edu => ({
            degree: edu.degree?.trim() || '',
            school: edu.school?.trim() || '',
            location: edu.location?.trim(),
            startDate: edu.startDate || '',
            endDate: edu.endDate
        })) || [],
        certifications: resume.certifications?.map(cert => ({
            name: cert.name?.trim() || '',
            issuer: cert.issuer?.trim() || '',
            date: cert.date || ''
        })) || [],
        skills: resume.skills?.map(skill => {
            const skillText = typeof skill === 'string' ? skill : skill.category
            return skillText?.trim()
        }).filter(skill => skill && skill.length > 0) || [],
        factsInventory: resume.factsInventory
    }
}
