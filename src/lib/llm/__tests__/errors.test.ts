import { 
  LLMError, 
  LLMTimeoutError, 
  LLMRateLimitError, 
  LLMQuotaExceededError, 
  LLMInvalidRequestError, 
  LLMAuthenticationError,
  isRetryableError 
} from '../errors';

describe('LLMError', () => {
  it('should create error with correct properties', () => {
    const error = new LLMError('Test error', 'openai', 500, true);
    
    expect(error.message).toBe('Test error');
    expect(error.provider).toBe('openai');
    expect(error.statusCode).toBe(500);
    expect(error.retryable).toBe(true);
    expect(error.name).toBe('LLMError');
  });

  it('should default retryable to false', () => {
    const error = new LLMError('Test error', 'openai');
    
    expect(error.retryable).toBe(false);
  });
});

describe('LLMTimeoutError', () => {
  it('should create timeout error with correct properties', () => {
    const error = new LLMTimeoutError('openai', 5000);
    
    expect(error.message).toBe('Request timed out after 5000ms');
    expect(error.provider).toBe('openai');
    expect(error.statusCode).toBe(408);
    expect(error.retryable).toBe(true);
    expect(error.name).toBe('LLMTimeoutError');
  });
});

describe('LLMRateLimitError', () => {
  it('should create rate limit error without retry after', () => {
    const error = new LLMRateLimitError('openai');
    
    expect(error.message).toBe('Rate limit exceeded');
    expect(error.provider).toBe('openai');
    expect(error.statusCode).toBe(429);
    expect(error.retryable).toBe(true);
    expect(error.name).toBe('LLMRateLimitError');
  });

  it('should create rate limit error with retry after', () => {
    const error = new LLMRateLimitError('openai', 60);
    
    expect(error.message).toBe('Rate limit exceeded, retry after 60s');
    expect(error.provider).toBe('openai');
    expect(error.statusCode).toBe(429);
    expect(error.retryable).toBe(true);
  });
});

describe('LLMQuotaExceededError', () => {
  it('should create quota exceeded error', () => {
    const error = new LLMQuotaExceededError('openai');
    
    expect(error.message).toBe('API quota exceeded');
    expect(error.provider).toBe('openai');
    expect(error.statusCode).toBe(402);
    expect(error.retryable).toBe(false);
    expect(error.name).toBe('LLMQuotaExceededError');
  });
});

describe('LLMInvalidRequestError', () => {
  it('should create invalid request error', () => {
    const error = new LLMInvalidRequestError('openai', 'Invalid parameters');
    
    expect(error.message).toBe('Invalid request: Invalid parameters');
    expect(error.provider).toBe('openai');
    expect(error.statusCode).toBe(400);
    expect(error.retryable).toBe(false);
    expect(error.name).toBe('LLMInvalidRequestError');
  });
});

describe('LLMAuthenticationError', () => {
  it('should create authentication error', () => {
    const error = new LLMAuthenticationError('openai');
    
    expect(error.message).toBe('Invalid API key or authentication failed');
    expect(error.provider).toBe('openai');
    expect(error.statusCode).toBe(401);
    expect(error.retryable).toBe(false);
    expect(error.name).toBe('LLMAuthenticationError');
  });
});

describe('isRetryableError', () => {
  it('should return true for retryable LLMError', () => {
    const error = new LLMError('Test error', 'openai', 500, true);
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return false for non-retryable LLMError', () => {
    const error = new LLMError('Test error', 'openai', 400, false);
    expect(isRetryableError(error)).toBe(false);
  });

  it('should return true for network errors', () => {
    const error = new Error('ECONNRESET');
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return true for DNS errors', () => {
    const error = new Error('ENOTFOUND');
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return true for timeout errors', () => {
    const error = new Error('ETIMEDOUT');
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return false for other errors', () => {
    const error = new Error('Some other error');
    expect(isRetryableError(error)).toBe(false);
  });
});
