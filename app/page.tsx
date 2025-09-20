'use client'

import { useState } from 'react'
import { WizardState } from '../src/types/resume'
import StartScreen from '../src/components/wizard/StartScreen'
import TextParser from '../src/components/wizard/TextParser'
import SectionEditor from '../src/components/wizard/SectionEditor'
import ValidationScreen from '../src/components/wizard/ValidationScreen'

export default function Home() {
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
                return <TextParser
                    pastedText={wizardState.pastedText!}
                    onNext={handleWizardUpdate}
                />
            case 'edit':
                return <SectionEditor
                    parsedSections={wizardState.parsedSections}
                    resume={wizardState.resume}
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