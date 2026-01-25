'use client'

import { useState } from 'react'
import { WizardState } from '@/types/resume'
import StartScreen from '@/components/wizard/StartScreen'
import TextParserBackend from '@/components/wizard/TextParserBackend'
import SectionEditor from '@/components/wizard/SectionEditor'
import ValidationScreen from '@/components/wizard/ValidationScreen'

import { ResumeService } from '@/lib/resumeService'
import withAuth from '@/lib/withAuth'

function NewResumePage() {
    const [wizardState, setWizardState] = useState<WizardState>({
        step: 'start',
        parsedSections: [],
        resume: {},
        validationErrors: []
    })

    const handleWizardUpdate = (updates: Partial<WizardState>) => {
        setWizardState(prev => ({ ...prev, ...updates }))
    }

    const renderCurrentStep = () => {
        switch (wizardState.step) {
            case 'start':
                return <StartScreen onNext={handleWizardUpdate} />
            case 'parse':
                return <TextParserBackend
                    pastedText={wizardState.pastedText!}
                    onNext={handleWizardUpdate}
                    userId="default-user"
                />
            case 'edit':
                return <SectionEditor
                    parsedSections={wizardState.parsedSections}
                    resume={wizardState.resume}
                    pastedText={wizardState.pastedText}
                    onNext={handleWizardUpdate}
                />
            case 'validate':
                return <ValidationScreen
                    resume={wizardState.resume as any}
                    validationErrors={wizardState.validationErrors}
                    onNext={handleWizardUpdate}
                />
            default:
                return <StartScreen onNext={handleWizardUpdate} />
        }
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
                        Resume Editor
                    </h1>
                    {renderCurrentStep()}
                </div>
            </div>
        </main>
    )
}
export default withAuth(NewResumePage)
