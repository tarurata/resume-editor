import { LLMProvider, LLMConfig, LLMParams, LLMResponse } from '../types';
import { MockProvider } from './mock';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';

export function createProvider(providerName: string): LLMProvider {
  switch (providerName) {
    case 'openai':
      return new OpenAIProvider();
    case 'anthropic':
      return new AnthropicProvider();
    case 'mock':
    default:
      return new MockProvider();
  }
}

export { MockProvider, OpenAIProvider, AnthropicProvider };
