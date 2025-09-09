# LLM Adapter

A provider-agnostic adapter for LLM calls with timeouts, retries, and telemetry hooks.

## Features

- **Provider Agnostic**: Support for OpenAI, Anthropic, and Mock providers
- **Environment Configuration**: Easy configuration via environment variables
- **Timeout & Retry**: Configurable timeouts and exponential backoff retry logic
- **Token Guards**: Built-in token limit validation
- **Telemetry Hooks**: Track duration, status, and token usage
- **Error Handling**: Meaningful error messages with retry guidance
- **TypeScript Support**: Full type safety and IntelliSense

## Quick Start

```typescript
import { createLLMAdapter } from '@/lib/llm';

// Create adapter with default configuration
const adapter = createLLMAdapter();

// Generate text
const response = await adapter.generate('Write a professional summary for a software engineer');
console.log(response.text);
```

## Configuration

### Environment Variables

```bash
# Provider selection
LLM_PROVIDER=openai  # or 'anthropic' or 'mock'

# API Configuration
LLM_API_KEY=your-api-key-here
LLM_BASE_URL=https://api.openai.com/v1  # Optional, for custom endpoints

# Timeout and Retry
LLM_TIMEOUT=30000        # Request timeout in milliseconds
LLM_MAX_RETRIES=3        # Maximum number of retries
LLM_RETRY_DELAY=1000     # Base delay for retries in milliseconds

# Token Limits
LLM_MAX_TOKENS=4000      # Maximum tokens per request
```

### Programmatic Configuration

```typescript
import { createLLMAdapter } from '@/lib/llm';

const adapter = createLLMAdapter({
  provider: 'openai',
  apiKey: 'your-api-key',
  timeout: 60000,
  maxRetries: 5,
  retryDelay: 2000,
  maxTokens: 8000,
});
```

## Usage Examples

### Basic Usage

```typescript
const adapter = createLLMAdapter();

// Simple text generation
const response = await adapter.generate('Help me write a resume');

// With custom parameters
const response = await adapter.generate('Improve this text', {
  temperature: 0.3,
  maxTokens: 500,
  model: 'gpt-4',
});
```

### Telemetry Tracking

```typescript
const adapter = createLLMAdapter();

// Add telemetry hook
adapter.addTelemetryHook((telemetry) => {
  console.log('LLM Call:', {
    provider: telemetry.provider,
    status: telemetry.status,
    duration: `${telemetry.duration}ms`,
    tokens: telemetry.tokens,
    retryCount: telemetry.retryCount,
  });
});

const response = await adapter.generate('Test prompt');
```

### Error Handling

```typescript
import { LLMError, isRetryableError } from '@/lib/llm';

try {
  const response = await adapter.generate('Test prompt');
} catch (error) {
  if (error instanceof LLMError) {
    console.error(`LLM Error (${error.provider}):`, error.message);
    
    if (isRetryableError(error)) {
      console.log('This error can be retried');
    }
  }
}
```

### Provider Switching

```typescript
// OpenAI
const openaiAdapter = createLLMAdapter({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
});

// Anthropic
const anthropicAdapter = createLLMAdapter({
  provider: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Mock (for testing)
const mockAdapter = createLLMAdapter({
  provider: 'mock',
});
```

## API Reference

### LLMAdapter

```typescript
interface LLMAdapter {
  generate(prompt: string, params?: LLMParams): Promise<LLMResponse>;
  getConfig(): LLMConfig;
  addTelemetryHook(hook: (telemetry: LLMTelemetry) => void): void;
  removeTelemetryHook(hook: (telemetry: LLMTelemetry) => void): void;
}
```

### LLMParams

```typescript
interface LLMParams {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}
```

### LLMResponse

```typescript
interface LLMResponse {
  text: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  model?: string;
  finishReason?: string;
}
```

## Error Types

- `LLMError`: Base error class
- `LLMTimeoutError`: Request timeout
- `LLMRateLimitError`: Rate limit exceeded
- `LLMQuotaExceededError`: API quota exceeded
- `LLMInvalidRequestError`: Invalid request parameters
- `LLMAuthenticationError`: Authentication failed

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Development

The adapter is designed to be easily extensible. To add a new provider:

1. Create a new provider class implementing `LLMProvider`
2. Add it to the `createProvider` function in `providers/index.ts`
3. Add tests for the new provider

## License

MIT
