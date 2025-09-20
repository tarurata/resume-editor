// Main exports for the LLM adapter
export { createLLMAdapter, LLMAdapterImpl } from './adapter';
export { getLLMConfig, validateLLMConfig } from './config';
export {
  LLMError,
  LLMTimeoutError,
  LLMRateLimitError,
  LLMQuotaExceededError,
  LLMInvalidRequestError,
  LLMAuthenticationError,
  isRetryableError
} from './errors';
export { MockProvider, OpenAIProvider, AnthropicProvider } from './providers';
export { AIService, getAIService, createAIService } from './aiService';
export { RateLimiter, DEFAULT_RATE_LIMITS } from './rateLimiter';
export {
  getCurrentPhase,
  getPhaseConfig,
  isPhase,
  canUseRealAI,
  shouldUseMockProvider,
  PHASE_CONFIGS
} from './phase';
export type {
  LLMAdapter,
  LLMConfig,
  LLMParams,
  LLMResponse,
  LLMTelemetry,
  LLMProvider
} from './types';
export type { AIServiceConfig, AIServiceOptions } from './aiService';
export type { RateLimitConfig, RateLimitState } from './rateLimiter';
export type { ProjectPhase, PhaseConfig } from './phase';
