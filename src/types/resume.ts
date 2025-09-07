export interface ExperienceEntry {
    role: string;
    organization: string;
    location?: string;
    startDate: string; // YYYY-MM format
    endDate: string | null; // YYYY-MM format or null for current
    bullets: string[];
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

export interface Resume {
    title: string;
    summary: string;
    experience: ExperienceEntry[];
    skills: string[];
    factsInventory?: FactsInventory;
}

export interface ParsedSection {
    type: 'title' | 'summary' | 'experience' | 'skills';
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
