export class LLMError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly statusCode?: number,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

export class LLMTimeoutError extends LLMError {
  constructor(provider: string, timeout: number) {
    super(`Request timed out after ${timeout}ms`, provider, 408, true);
    this.name = 'LLMTimeoutError';
  }
}

export class LLMRateLimitError extends LLMError {
  constructor(provider: string, retryAfter?: number) {
    super(`Rate limit exceeded${retryAfter ? `, retry after ${retryAfter}s` : ''}`, provider, 429, true);
    this.name = 'LLMRateLimitError';
  }
}

export class LLMQuotaExceededError extends LLMError {
  constructor(provider: string) {
    super('API quota exceeded', provider, 402, false);
    this.name = 'LLMQuotaExceededError';
  }
}

export class LLMInvalidRequestError extends LLMError {
  constructor(provider: string, message: string) {
    super(`Invalid request: ${message}`, provider, 400, false);
    this.name = 'LLMInvalidRequestError';
  }
}

export class LLMAuthenticationError extends LLMError {
  constructor(provider: string) {
    super('Invalid API key or authentication failed', provider, 401, false);
    this.name = 'LLMAuthenticationError';
  }
}

export function isRetryableError(error: Error): boolean {
  if (error instanceof LLMError) {
    return error.retryable;
  }
  
  // Network errors are generally retryable
  if (error.message.includes('ECONNRESET') || 
      error.message.includes('ENOTFOUND') || 
      error.message.includes('ETIMEDOUT')) {
    return true;
  }
  
  return false;
}
