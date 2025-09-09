export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'mock';
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  maxTokens?: number;
}

export interface LLMParams {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

export interface LLMResponse {
  text: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  model?: string;
  finishReason?: string;
}

export interface LLMTelemetry {
  duration: number;
  status: 'success' | 'error' | 'timeout' | 'retry';
  provider: string;
  model?: string;
  tokens?: {
    prompt?: number;
    completion?: number;
    total?: number;
  };
  retryCount?: number;
  error?: string;
}

export interface LLMAdapter {
  generate(prompt: string, params?: LLMParams): Promise<LLMResponse>;
  getConfig(): LLMConfig;
}

export interface LLMProvider {
  generate(prompt: string, params: LLMParams, config: LLMConfig): Promise<LLMResponse>;
  validateConfig(config: LLMConfig): void;
}
