'use client'

import { Resume, PersonalInfo } from '@/types/resume'

interface LatexStyleResumeProps {
    resume: Resume
    personalInfo?: PersonalInfo | null
}

export function LatexStyleResume({ resume, personalInfo }: LatexStyleResumeProps) {
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Present'
        const date = new Date(dateStr + '-01')
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        })
    }

    const formatDateRange = (startDate: string | null, endDate: string | null) => {
        const start = formatDate(startDate)
        const end = formatDate(endDate)
        return `${start} -- ${end}`
    }

    return (
        <div className="latex-resume">
            <style jsx>{`
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
                    flex-direction: column;
                    gap: 8pt;
                }

                .skill-subsection {
                    margin-bottom: 6pt;
                }

                .skill-subsection-title {
                    font-weight: bold;
                    font-size: 10pt;
                    margin-bottom: 2pt;
                }

                .skill-subsection-title::after {
                    content: ":";
                }

                .skill-list {
                    font-size: 10pt;
                    line-height: 1.3;
                }

                .skill-item {
                    display: inline;
                }

                .skill-item:not(:last-child)::after {
                    content: ", ";
                }

                /* Print styles */
                @media print {
                    .latex-resume {
                        margin: 0;
                        padding: 0.5in;
                        max-width: none;
                        width: 100%;
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
            `}</style>

            {/* Header */}
            <div className="resume-header">
                <div className="resume-name">{personalInfo?.name || resume.personalInfo?.name || 'Your Name'}</div>
                <div className="resume-title">{resume.title || 'Professional Title'}</div>
                <div className="contact-info">
                    {(personalInfo?.phone || resume.personalInfo?.phone) && (
                        <span>{personalInfo?.phone || resume.personalInfo?.phone}</span>
                    )}
                    {(personalInfo?.phone || resume.personalInfo?.phone) && (personalInfo?.email || resume.personalInfo?.email) && <span> | </span>}
                    {(personalInfo?.email || resume.personalInfo?.email) && (
                        <a href={`mailto:${personalInfo?.email || resume.personalInfo?.email}`}>
                            <u>{personalInfo?.email || resume.personalInfo?.email}</u>
                        </a>
                    )}
                    {(personalInfo?.email || resume.personalInfo?.email) && (personalInfo?.linkedin || resume.personalInfo?.linkedin) && <span> | </span>}
                    {(personalInfo?.linkedin || resume.personalInfo?.linkedin) && (
                        <a href={personalInfo?.linkedin || resume.personalInfo?.linkedin} target="_blank" rel="noopener noreferrer">
                            <u>{personalInfo?.linkedin || resume.personalInfo?.linkedin}</u>
                        </a>
                    )}
                    {(personalInfo?.linkedin || resume.personalInfo?.linkedin) && (personalInfo?.github || resume.personalInfo?.github) && <span> | </span>}
                    {(personalInfo?.github || resume.personalInfo?.github) && (
                        <a href={personalInfo?.github || resume.personalInfo?.github} target="_blank" rel="noopener noreferrer">
                            <u>{personalInfo?.github || resume.personalInfo?.github}</u>
                        </a>
                    )}
                </div>
            </div>

            {/* Summary */}
            {resume.summary && (
                <div className="section">
                    <div className="section-title">Summary</div>
                    <div className="summary-text">
                        {resume.summary}
                    </div>
                </div>
            )}

            {/* Experience */}
            {resume.experience && resume.experience.length > 0 && (
                <div className="section">
                    <div className="section-title">Experience</div>
                    {resume.experience.map((exp, index) => (
                        <div key={index} className="experience-item">
                            <div className="experience-header">
                                <div>
                                    <div className="experience-role">{exp.role}</div>
                                    <div className="experience-org">{exp.organization}</div>
                                    {exp.location && (
                                        <div className="experience-location">{exp.location}</div>
                                    )}
                                </div>
                                <div className="experience-dates">
                                    {formatDateRange(exp.startDate, exp.endDate)}
                                </div>
                            </div>
                            {exp.achievements && exp.achievements.length > 0 && (
                                <ul className="experience-bullets">
                                    {exp.achievements.map((achievement, achievementIndex) => (
                                        <li key={achievementIndex}>{achievement}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Education */}
            {resume.education && resume.education.length > 0 && (
                <div className="section">
                    <div className="section-title">Education</div>
                    {resume.education.map((edu, index) => (
                        <div key={index} className="education-item">
                            <div className="education-header">
                                <div>
                                    <div className="education-degree">{edu.degree}</div>
                                    <div className="education-school">{edu.school}</div>
                                    {edu.location && (
                                        <div className="education-location">{edu.location}</div>
                                    )}
                                </div>
                                <div className="education-dates">
                                    {formatDateRange(edu.startDate, edu.endDate)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Certifications */}
            {resume.certifications && resume.certifications.length > 0 && (
                <div className="section">
                    <div className="section-title">Certifications</div>
                    {resume.certifications.map((cert, index) => (
                        <div key={index} className="certifications-item">
                            <div className="certifications-header">
                                <div>
                                    <div className="certification-name">{cert.name}</div>
                                    <div className="certification-issuer">{cert.issuer}</div>
                                </div>
                                <div className="certification-date">
                                    {formatDate(cert.date)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Skills */}
            {resume.skills && resume.skills.length > 0 && (
                <div className="section">
                    <div className="section-title">Technical Skills</div>
                    <div className="skills-container">
                        {resume.skills.map((subsection, index) => (
                            <div key={index} className="skill-subsection">
                                <div className="skill-subsection-title">{subsection.name || 'Untitled'}</div>
                                <div className="skill-list">
                                    {(subsection.skills || []).map((skill, skillIndex) => (
                                        <span key={skillIndex} className="skill-item">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
