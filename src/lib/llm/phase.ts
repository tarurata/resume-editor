/**
 * Phase Configuration for Resume Editor
 * 
 * M1: Frontend-only with mock AI responses
 * M2: Full AI integration with real providers
 */

export type ProjectPhase = 'M1' | 'M2';

export interface PhaseConfig {
    phase: ProjectPhase;
    defaultProvider: 'openai' | 'anthropic' | 'mock';
    requiresApiKey: boolean;
    features: {
        realAI: boolean;
        mockAI: boolean;
        rateLimiting: boolean;
        tokenManagement: boolean;
        logging: boolean;
    };
}

export const PHASE_CONFIGS: Record<ProjectPhase, PhaseConfig> = {
    M1: {
        phase: 'M1',
        defaultProvider: 'mock',
        requiresApiKey: false,
        features: {
            realAI: false,
            mockAI: true,
            rateLimiting: true,
            tokenManagement: true,
            logging: true,
        },
    },
    M2: {
        phase: 'M2',
        defaultProvider: 'openai',
        requiresApiKey: true,
        features: {
            realAI: true,
            mockAI: true,
            rateLimiting: true,
            tokenManagement: true,
            logging: true,
        },
    },
};

export function getCurrentPhase(): ProjectPhase {
    // Check environment variable first
    const envPhase = process.env.PROJECT_PHASE as ProjectPhase;
    if (envPhase && (envPhase === 'M1' || envPhase === 'M2')) {
        return envPhase;
    }

    // Check if API key is available (indicates M2)
    if (process.env.LLM_API_KEY && process.env.LLM_PROVIDER !== 'mock') {
        return 'M2';
    }

    // Import the phase configuration
    try {
        const { EFFECTIVE_PHASE } = require('./phase-config');
        return EFFECTIVE_PHASE;
    } catch {
        // Fallback to M2 if phase-config is not available
        return 'M2';
    }
}

export function getPhaseConfig(): PhaseConfig {
    const phase = getCurrentPhase();
    return PHASE_CONFIGS[phase];
}

export function isPhase(phase: ProjectPhase): boolean {
    return getCurrentPhase() === phase;
}

export function canUseRealAI(): boolean {
    const config = getPhaseConfig();
    return config.features.realAI && !!process.env.LLM_API_KEY;
}

export function shouldUseMockProvider(): boolean {
    const config = getPhaseConfig();
    return !canUseRealAI() || config.defaultProvider === 'mock';
}
