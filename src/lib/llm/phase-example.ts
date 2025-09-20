/**
 * Phase Configuration Examples
 * 
 * This file demonstrates how to work with different project phases
 * and how the AI service adapts automatically.
 */

import {
    getAIService,
    getCurrentPhase,
    getPhaseConfig,
    canUseRealAI,
    shouldUseMockProvider,
    PHASE_CONFIGS
} from './index';

// Example 1: Check current phase
export function checkCurrentPhase() {
    const phase = getCurrentPhase();
    const config = getPhaseConfig();

    console.log(`Current Phase: ${phase}`);
    console.log(`Default Provider: ${config.defaultProvider}`);
    console.log(`Requires API Key: ${config.requiresApiKey}`);
    console.log(`Can Use Real AI: ${canUseRealAI()}`);
    console.log(`Should Use Mock: ${shouldUseMockProvider()}`);
}

// Example 2: Phase-aware AI usage
export async function phaseAwareAIUsage() {
    const aiService = getAIService();
    const phaseInfo = aiService.getPhaseInfo();

    console.log('Phase Info:', phaseInfo);

    // The AI service automatically chooses the right provider
    const response = await aiService.generate(
        "Write a professional summary for a software engineer"
    );

    console.log('Response:', response.text);
    console.log('Provider used:', phaseInfo.provider);
}

// Example 3: Conditional features based on phase
export function getAvailableFeatures() {
    const config = getPhaseConfig();

    return {
        canImproveResume: config.features.realAI || config.features.mockAI,
        canGenerateCoverLetter: config.features.realAI || config.features.mockAI,
        canAnalyzeResume: config.features.realAI || config.features.mockAI,
        hasRateLimiting: config.features.rateLimiting,
        hasTokenManagement: config.features.tokenManagement,
        hasLogging: config.features.logging,
    };
}

// Example 4: Switching phases (for development)
export function switchPhaseExample() {
    console.log('Available phases:');
    Object.keys(PHASE_CONFIGS).forEach(phase => {
        const config = PHASE_CONFIGS[phase as keyof typeof PHASE_CONFIGS];
        console.log(`- ${phase}: ${config.defaultProvider} provider, API key required: ${config.requiresApiKey}`);
    });

    console.log('\nTo switch phases:');
    console.log('1. Update src/lib/llm/phase-config.ts');
    console.log('2. Or set PROJECT_PHASE environment variable');
    console.log('3. Or provide API key for automatic M2 detection');
}

// Example 5: Phase-specific configuration
export function getPhaseSpecificConfig() {
    const phase = getCurrentPhase();

    if (phase === 'M1') {
        return {
            message: 'Using mock AI responses for development',
            provider: 'mock',
            needsApiKey: false,
            features: ['resume-improvement', 'cover-letter-generation', 'ats-optimization'],
        };
    } else {
        return {
            message: 'Using real AI providers',
            provider: 'openai', // or anthropic
            needsApiKey: true,
            features: ['resume-improvement', 'cover-letter-generation', 'ats-optimization', 'real-ai-analysis'],
        };
    }
}

// Example 6: Development vs Production setup
export function getSetupInstructions() {
    const phase = getCurrentPhase();

    if (phase === 'M1') {
        return {
            phase: 'M1',
            instructions: [
                'No setup required - works out of the box',
                'Uses mock AI responses for all features',
                'Perfect for frontend development and testing',
                'All AI features work without external dependencies',
            ],
            envVars: [],
        };
    } else {
        return {
            phase: 'M2',
            instructions: [
                'Set up API key for your chosen provider',
                'Configure environment variables',
                'Real AI responses for all features',
                'Rate limiting and token management active',
            ],
            envVars: [
                'LLM_PROVIDER=openai',
                'LLM_API_KEY=your_api_key_here',
                'LLM_MAX_TOKENS=4000',
            ],
        };
    }
}

// Run examples (uncomment to test)
// checkCurrentPhase();
// phaseAwareAIUsage();
// console.log('Available features:', getAvailableFeatures());
// switchPhaseExample();
// console.log('Phase-specific config:', getPhaseSpecificConfig());
// console.log('Setup instructions:', getSetupInstructions());
