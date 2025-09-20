# AI Service Configuration

This document explains how to configure the AI service for the resume editor.

## Project Phases

The AI service supports two phases:

- **M1**: Frontend-only with mock AI responses (no API keys required)
- **M2**: Full AI integration with real providers (API keys required)

### Current Phase: M2

The project is currently in **M2 phase** with real AI integration. You can switch phases by:

1. **Update phase configuration**: Edit `src/lib/llm/phase-config.ts`
2. **Environment variable**: Set `PROJECT_PHASE=M1` or `PROJECT_PHASE=M2` in `.env.local`
3. **Automatic detection**: Provide API key to automatically use M2

## M1 Setup (Mock AI - No API Keys Required)

For M1 phase, the AI service works out of the box with the mock provider:

```bash
# Set phase to M1
PROJECT_PHASE=M1
```

## M2 Setup (Real AI - API Keys Required)

For M2 phase, configure your preferred AI provider:

```bash
# Set phase to M2 (or let it auto-detect with API key)
PROJECT_PHASE=M2

# AI Service Configuration
LLM_PROVIDER=openai
LLM_API_KEY=your_openai_api_key_here

# Optional: Custom base URL for API calls
# LLM_BASE_URL=https://api.openai.com/v1

# Request Configuration
LLM_TIMEOUT=30000
LLM_MAX_RETRIES=3
LLM_RETRY_DELAY=1000
LLM_MAX_TOKENS=4000

# Rate Limiting (optional, uses defaults if not set)
# LLM_RATE_LIMIT_MAX_REQUESTS=100
# LLM_RATE_LIMIT_WINDOW_MS=60000
# LLM_RATE_LIMIT_MAX_TOKENS_PER_WINDOW=150000
# LLM_RATE_LIMIT_MAX_TOKENS_PER_REQUEST=4000

# Logging Configuration
LLM_ENABLE_LOGGING=true
LLM_LOG_LEVEL=info
```

## Usage

### Phase Detection

```typescript
import { getCurrentPhase, canUseRealAI, getAIService } from '@/lib/llm';

// Check current phase
const phase = getCurrentPhase(); // 'M1' or 'M2'
console.log(`Current phase: ${phase}`);

// Check if real AI is available
if (canUseRealAI()) {
  console.log('Real AI providers available');
} else {
  console.log('Using mock AI responses');
}

// Get AI service (automatically chooses right provider)
const aiService = getAIService();
const phaseInfo = aiService.getPhaseInfo();
console.log('Provider:', phaseInfo.provider);
```

### Basic Usage (Works in Both Phases)

```typescript
import { getAIService } from '@/lib/llm';

// Automatically uses mock for M1, real AI for M2
const aiService = getAIService();

// Generate text (adapts to current phase)
const response = await aiService.generate(
  "Write a professional summary for a software engineer",
  { temperature: 0.7, maxTokens: 200 }
);

console.log(response.text); // Real AI response in M2, mock in M1
```

### Advanced Usage with Options

```typescript
import { createAIService } from '@/lib/llm';

const aiService = createAIService({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  maxTokens: 4000,
  rateLimit: {
    maxRequests: 50,
    windowMs: 60000,
    maxTokensPerWindow: 100000,
  }
});

const response = await aiService.generate(
  "Improve this resume section",
  { model: 'gpt-4o-mini' },
  { userId: 'user123', feature: 'resume-improvement' }
);
```

### Rate Limiting

The AI service includes built-in rate limiting to prevent API quota exhaustion:

```typescript
// Check rate limit status
const status = aiService.getRateLimitStatus({ userId: 'user123' });
console.log(`Remaining requests: ${status.remainingRequests}`);
console.log(`Remaining tokens: ${status.remainingTokens}`);
console.log(`Time until reset: ${status.timeUntilReset}ms`);
```

### Error Handling

```typescript
import { LLMRateLimitError, LLMQuotaExceededError } from '@/lib/llm';

try {
  const response = await aiService.generate(prompt);
} catch (error) {
  if (error instanceof LLMRateLimitError) {
    console.log('Rate limit exceeded, please wait');
  } else if (error instanceof LLMQuotaExceededError) {
    console.log('API quota exceeded');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Features

- **Provider Abstraction**: Support for OpenAI, Anthropic, and Mock providers
- **Rate Limiting**: Configurable rate limits per user/session
- **Token Management**: Automatic token counting and limits
- **Retry Logic**: Exponential backoff for retryable errors
- **Logging**: Comprehensive logging and monitoring
- **Type Safety**: Full TypeScript support
- **Error Handling**: Detailed error types and handling

## Default Models

- **OpenAI**: `gpt-4o-mini` (default)
- **Anthropic**: `claude-3-sonnet`
- **Mock**: `mock-model`

## Rate Limits (Default)

- **OpenAI**: 100 requests/minute, 150k tokens/minute
- **Anthropic**: 50 requests/minute, 100k tokens/minute
- **Mock**: 1000 requests/minute, 1M tokens/minute

## Getting API Keys

### OpenAI
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Generate a new API key
4. Add it to your `.env.local` file

### Anthropic
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Generate an API key
4. Add it to your `.env.local` file

## Testing

The mock provider is perfect for development and testing. It simulates API responses without making real API calls.