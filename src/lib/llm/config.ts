import { LLMConfig } from './types';

export function getLLMConfig(): LLMConfig {
  const provider = (process.env.LLM_PROVIDER as 'openai' | 'anthropic' | 'mock') || 'mock';
  
  return {
    provider,
    apiKey: process.env.LLM_API_KEY,
    baseUrl: process.env.LLM_BASE_URL,
    timeout: parseInt(process.env.LLM_TIMEOUT || '30000', 10),
    maxRetries: parseInt(process.env.LLM_MAX_RETRIES || '3', 10),
    retryDelay: parseInt(process.env.LLM_RETRY_DELAY || '1000', 10),
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '4000', 10),
  };
}

export function validateLLMConfig(config: LLMConfig): void {
  if (!config.provider) {
    throw new Error('LLM provider is required');
  }

  if (config.provider !== 'mock' && !config.apiKey) {
    throw new Error(`API key is required for provider: ${config.provider}`);
  }

  if (config.timeout && config.timeout < 1000) {
    throw new Error('Timeout must be at least 1000ms');
  }

  if (config.maxRetries && config.maxRetries < 0) {
    throw new Error('Max retries must be non-negative');
  }

  if (config.maxTokens && config.maxTokens < 1) {
    throw new Error('Max tokens must be positive');
  }
}
