export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  maxTokensPerWindow?: number;
  maxTokensPerRequest?: number;
}

export interface RateLimitState {
  requests: number[];
  tokensUsed: number;
  windowStart: number;
}

export class RateLimiter {
  private state: Map<string, RateLimitState> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async checkLimit(key: string, tokenCount: number = 0): Promise<boolean> {
    const now = Date.now();
    const state = this.getOrCreateState(key);
    
    // Clean up old requests outside the window
    this.cleanupOldRequests(state, now);
    
    // Check request limit
    if (state.requests.length >= this.config.maxRequests) {
      return false;
    }
    
    // Check token limits
    if (this.config.maxTokensPerRequest && tokenCount > this.config.maxTokensPerRequest) {
      return false;
    }
    
    if (this.config.maxTokensPerWindow && state.tokensUsed + tokenCount > this.config.maxTokensPerWindow) {
      return false;
    }
    
    return true;
  }

  async recordRequest(key: string, tokenCount: number = 0): Promise<void> {
    const now = Date.now();
    const state = this.getOrCreateState(key);
    
    state.requests.push(now);
    state.tokensUsed += tokenCount;
  }

  getTimeUntilReset(key: string): number {
    const state = this.state.get(key);
    if (!state || state.requests.length === 0) {
      return 0;
    }
    
    const oldestRequest = Math.min(...state.requests);
    const resetTime = oldestRequest + this.config.windowMs;
    return Math.max(0, resetTime - Date.now());
  }

  getRemainingRequests(key: string): number {
    const state = this.state.get(key);
    if (!state) {
      return this.config.maxRequests;
    }
    
    this.cleanupOldRequests(state, Date.now());
    return Math.max(0, this.config.maxRequests - state.requests.length);
  }

  getRemainingTokens(key: string): number {
    const state = this.state.get(key);
    if (!state || !this.config.maxTokensPerWindow) {
      return this.config.maxTokensPerWindow || Infinity;
    }
    
    this.cleanupOldRequests(state, Date.now());
    return Math.max(0, this.config.maxTokensPerWindow - state.tokensUsed);
  }

  private getOrCreateState(key: string): RateLimitState {
    if (!this.state.has(key)) {
      this.state.set(key, {
        requests: [],
        tokensUsed: 0,
        windowStart: Date.now(),
      });
    }
    return this.state.get(key)!;
  }

  private cleanupOldRequests(state: RateLimitState, now: number): void {
    const cutoff = now - this.config.windowMs;
    state.requests = state.requests.filter(timestamp => timestamp > cutoff);
    
    // Reset token count if window has passed
    if (state.windowStart < cutoff) {
      state.tokensUsed = 0;
      state.windowStart = now;
    }
  }

  // Clean up old entries to prevent memory leaks
  cleanup(): void {
    const now = Date.now();
    for (const [key, state] of this.state.entries()) {
      this.cleanupOldRequests(state, now);
      if (state.requests.length === 0 && state.tokensUsed === 0) {
        this.state.delete(key);
      }
    }
  }
}

// Default rate limit configurations
export const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  openai: {
    maxRequests: 100, // 100 requests per minute
    windowMs: 60 * 1000, // 1 minute
    maxTokensPerWindow: 150000, // 150k tokens per minute
    maxTokensPerRequest: 4000, // 4k tokens per request
  },
  anthropic: {
    maxRequests: 50, // 50 requests per minute
    windowMs: 60 * 1000, // 1 minute
    maxTokensPerWindow: 100000, // 100k tokens per minute
    maxTokensPerRequest: 4000, // 4k tokens per request
  },
  mock: {
    maxRequests: 1000, // Very high limit for testing
    windowMs: 60 * 1000,
    maxTokensPerWindow: 1000000,
    maxTokensPerRequest: 10000,
  },
};
