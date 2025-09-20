/**
 * Current Project Phase Configuration
 * 
 * Update this file to change the current phase:
 * - M1: Frontend-only with mock AI responses
 * - M2: Full AI integration with real providers
 */

// Set the current phase here
export const CURRENT_PHASE = 'M2' as const;

// Environment variable override (optional)
// Set PROJECT_PHASE=M1 or PROJECT_PHASE=M2 in your .env.local
export const PHASE_OVERRIDE = process.env.PROJECT_PHASE as 'M1' | 'M2' | undefined;

// The effective phase (environment variable takes precedence)
export const EFFECTIVE_PHASE = PHASE_OVERRIDE || CURRENT_PHASE;
