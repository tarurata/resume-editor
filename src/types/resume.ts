export interface ExperienceEntry {
    role: string;
    organization: string;
    location?: string;
    startDate: string; // YYYY-MM format
    endDate: string | null; // YYYY-MM format or null for current
    achievements: string[];
}

export interface FactsInventory {
    skills: string[];
    organizations: string[];
    roles: string[];
    dates: Array<{
        start: string;
        end: string | null;
    }>;
    certifications: string[];
}

export interface PersonalInfo {
    name?: string;
    title?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
}

export interface EducationEntry {
    degree: string;
    school: string;
    location?: string;
    startDate: string;
    endDate: string | null;
}

export interface CertificationEntry {
    name: string;
    issuer: string;
    date: string;
}

export interface SkillCategory {
    category: string;
    skills: string[];
}

export interface SkillSubsection {
    name: string;
    skills: string[];
}

export interface Resume {
    id?: string;
    title: string;
    summary: string;
    personalInfo?: PersonalInfo;
    experience: ExperienceEntry[];
    education?: EducationEntry[];
    certifications?: CertificationEntry[];
    skills: SkillSubsection[];
    factsInventory?: FactsInventory;
}

export interface ParsedSection {
    type: 'title' | 'summary' | 'experience' | 'skills' | 'education' | 'certifications';
    content: string;
    startIndex: number;
    endIndex: number;
}

export interface WizardState {
    step: 'start' | 'parse' | 'edit' | 'validate';
    selectedTemplate?: string;
    pastedText?: string;
    parsedSections: ParsedSection[];
    resume: Partial<Resume>;
    validationErrors: string[];
}

export interface Template {
    id: string;
    name: string;
    description: string;
    data: Resume;
}

export interface ChangeEntry {
    id: string;
    timestamp: Date;
    sectionId: string;
    originalContent: string;
    newContent: string;
    rationale?: string;
    action: 'accept' | 'reject' | 'restore';
}

export interface SectionHistory {
    sectionId: string;
    changes: ChangeEntry[];
    originalContent: string;
    currentContent: string;
}

export interface DiffState {
    viewMode: 'clean' | 'diff';
    showHistory: boolean;
}

export type SectionType = 'title' | 'summary' | 'experience' | 'skills' | 'education' | 'certifications'
export type SectionId = string

export interface JobDescriptionExtraction {
    company_name?: string
    job_title?: string
    compensation?: string
    location?: string
    required_skills?: string[]
    preferred_skills?: string[]
    experience_level?: string
    employment_type?: string
    remote_work?: string
    benefits?: string[]
    responsibilities?: string[]
    qualifications?: string[]
}

export interface JDExtractionRequest {
    job_description: string
    user_id?: string
}

export interface JDExtractionResponse {
    success: boolean
    data?: JobDescriptionExtraction
    confidence?: number
    errors?: string[]
}
