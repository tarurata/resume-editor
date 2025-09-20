import {
    getCurrentPhase,
    getPhaseConfig,
    isPhase,
    canUseRealAI,
    shouldUseMockProvider,
    PHASE_CONFIGS
} from '../phase';

// Mock process.env
const originalEnv = process.env;

describe('Phase Configuration', () => {
    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('Phase Detection', () => {
        it('should detect M2 phase by default', () => {
            const phase = getCurrentPhase();
            expect(phase).toBe('M2');
        });

        it('should detect M1 phase from environment variable', () => {
            process.env.PROJECT_PHASE = 'M1';
            const phase = getCurrentPhase();
            expect(phase).toBe('M1');
        });

        it('should detect M2 phase from environment variable', () => {
            process.env.PROJECT_PHASE = 'M2';
            const phase = getCurrentPhase();
            expect(phase).toBe('M2');
        });

        it('should detect M2 phase when API key is provided', () => {
            process.env.LLM_API_KEY = 'test-key';
            process.env.LLM_PROVIDER = 'openai';
            const phase = getCurrentPhase();
            expect(phase).toBe('M2');
        });
    });

    describe('Phase Configuration', () => {
        it('should return correct M1 configuration', () => {
            process.env.PROJECT_PHASE = 'M1';
            const config = getPhaseConfig();

            expect(config.phase).toBe('M1');
            expect(config.defaultProvider).toBe('mock');
            expect(config.requiresApiKey).toBe(false);
            expect(config.features.realAI).toBe(false);
            expect(config.features.mockAI).toBe(true);
        });

        it('should return correct M2 configuration', () => {
            process.env.PROJECT_PHASE = 'M2';
            const config = getPhaseConfig();

            expect(config.phase).toBe('M2');
            expect(config.defaultProvider).toBe('openai');
            expect(config.requiresApiKey).toBe(true);
            expect(config.features.realAI).toBe(true);
            expect(config.features.mockAI).toBe(true);
        });
    });

    describe('Phase Helpers', () => {
        it('should correctly identify M1 phase', () => {
            process.env.PROJECT_PHASE = 'M1';
            expect(isPhase('M1')).toBe(true);
            expect(isPhase('M2')).toBe(false);
        });

        it('should correctly identify M2 phase', () => {
            process.env.PROJECT_PHASE = 'M2';
            expect(isPhase('M2')).toBe(true);
            expect(isPhase('M1')).toBe(false);
        });

        it('should detect real AI availability', () => {
            process.env.LLM_API_KEY = 'test-key';
            process.env.LLM_PROVIDER = 'openai';
            expect(canUseRealAI()).toBe(true);
        });

        it('should detect when mock should be used', () => {
            process.env.PROJECT_PHASE = 'M1';
            expect(shouldUseMockProvider()).toBe(true);
        });
    });

    describe('Phase Configs', () => {
        it('should have valid M1 configuration', () => {
            const m1Config = PHASE_CONFIGS.M1;

            expect(m1Config.phase).toBe('M1');
            expect(m1Config.defaultProvider).toBe('mock');
            expect(m1Config.requiresApiKey).toBe(false);
            expect(m1Config.features.realAI).toBe(false);
            expect(m1Config.features.mockAI).toBe(true);
        });

        it('should have valid M2 configuration', () => {
            const m2Config = PHASE_CONFIGS.M2;

            expect(m2Config.phase).toBe('M2');
            expect(m2Config.defaultProvider).toBe('openai');
            expect(m2Config.requiresApiKey).toBe(true);
            expect(m2Config.features.realAI).toBe(true);
            expect(m2Config.features.mockAI).toBe(true);
        });
    });
});
