import { createLLMAdapter } from './adapter';
import { LLMAdapter, LLMConfig, LLMParams, LLMResponse, LLMTelemetry } from './types';
import { RateLimiter, RateLimitConfig, DEFAULT_RATE_LIMITS } from './rateLimiter';
import { LLMError, LLMRateLimitError } from './errors';
import { getPhaseConfig, shouldUseMockProvider, canUseRealAI } from './phase';

export interface AIServiceConfig extends LLMConfig {
  rateLimit?: RateLimitConfig;
  enableLogging?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export interface AIServiceOptions {
  userId?: string;
  sessionId?: string;
  feature?: string;
  metadata?: Record<string, any>;
}

export class AIService {
  private adapter: LLMAdapter;
  private rateLimiter: RateLimiter;
  private config: AIServiceConfig;
  private logger: (level: string, message: string, data?: any) => void;

  constructor(config?: Partial<AIServiceConfig>) {
    const phaseConfig = getPhaseConfig();

    // Determine provider based on phase and configuration
    const provider = config?.provider ||
      (shouldUseMockProvider() ? 'mock' : phaseConfig.defaultProvider);

    this.config = {
      provider,
      maxTokens: 4000,
      timeout: 30000,
      maxRetries: 3,
      retryDelay: 1000,
      enableLogging: true,
      logLevel: 'info',
      ...config,
    };

    // Initialize rate limiter
    const rateLimitConfig = this.config.rateLimit || DEFAULT_RATE_LIMITS[this.config.provider] || DEFAULT_RATE_LIMITS.mock;
    this.rateLimiter = new RateLimiter(rateLimitConfig);

    // Initialize LLM adapter
    this.adapter = createLLMAdapter(this.config);

    // Set up logging
    this.logger = this.createLogger();

    // Add telemetry hook for monitoring
    this.adapter.addTelemetryHook((telemetry: LLMTelemetry) => {
      this.logger('info', 'LLM request completed', {
        provider: telemetry.provider,
        model: telemetry.model,
        duration: telemetry.duration,
        status: telemetry.status,
        tokens: telemetry.tokens,
        retryCount: telemetry.retryCount,
      });
    });

    // Clean up rate limiter periodically
    setInterval(() => {
      this.rateLimiter.cleanup();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  async generate(
    prompt: string,
    params?: LLMParams,
    options?: AIServiceOptions
  ): Promise<LLMResponse> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    try {
      this.logger('debug', 'AI request started', {
        requestId,
        promptLength: prompt.length,
        params,
        options,
      });

      // Check rate limits
      const rateLimitKey = this.getRateLimitKey(options);
      const estimatedTokens = this.estimateTokens(prompt);

      const canProceed = await this.rateLimiter.checkLimit(rateLimitKey, estimatedTokens);
      if (!canProceed) {
        const timeUntilReset = this.rateLimiter.getTimeUntilReset(rateLimitKey);
        throw new LLMRateLimitError(
          this.config.provider,
          Math.ceil(timeUntilReset / 1000)
        );
      }

      // Generate response
      const response = await this.adapter.generate(prompt, params);

      // Record successful request
      await this.rateLimiter.recordRequest(rateLimitKey, response.usage?.totalTokens || estimatedTokens);

      const duration = Date.now() - startTime;
      this.logger('info', 'AI request completed successfully', {
        requestId,
        duration,
        responseLength: response.text.length,
        tokensUsed: response.usage?.totalTokens,
      });

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger('error', 'AI request failed', {
        requestId,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      });

      throw error;
    }
  }

  async generateWithRetry(
    prompt: string,
    params?: LLMParams,
    options?: AIServiceOptions,
    maxRetries: number = 3
  ): Promise<LLMResponse> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.generate(prompt, params, options);
      } catch (error) {
        lastError = error as Error;

        // Don't retry on non-retryable errors
        if (error instanceof LLMRateLimitError ||
          error instanceof Error && !this.isRetryableError(error)) {
          throw error;
        }

        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          this.logger('warn', `AI request failed, retrying in ${delay}ms`, {
            attempt,
            maxRetries,
            error: lastError.message,
          });
          await this.sleep(delay);
        }
      }
    }

    throw lastError!;
  }

  getRateLimitStatus(options?: AIServiceOptions): {
    remainingRequests: number;
    remainingTokens: number;
    timeUntilReset: number;
  } {
    const rateLimitKey = this.getRateLimitKey(options);
    return {
      remainingRequests: this.rateLimiter.getRemainingRequests(rateLimitKey),
      remainingTokens: this.rateLimiter.getRemainingTokens(rateLimitKey),
      timeUntilReset: this.rateLimiter.getTimeUntilReset(rateLimitKey),
    };
  }

  getConfig(): AIServiceConfig {
    return { ...this.config };
  }

  getPhaseInfo(): { phase: string; provider: string; canUseRealAI: boolean } {
    const phaseConfig = getPhaseConfig();
    return {
      phase: phaseConfig.phase,
      provider: this.config.provider,
      canUseRealAI: canUseRealAI(),
    };
  }

  updateConfig(newConfig: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Recreate adapter if provider changed
    if (newConfig.provider) {
      this.adapter = createLLMAdapter(this.config);
    }

    // Update rate limiter if config changed
    if (newConfig.rateLimit) {
      this.rateLimiter = new RateLimiter(newConfig.rateLimit);
    }
  }

  private getRateLimitKey(options?: AIServiceOptions): string {
    // Use userId if available, otherwise sessionId, otherwise 'default'
    return options?.userId || options?.sessionId || 'default';
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createLogger() {
    return (level: string, message: string, data?: any) => {
      if (!this.config.enableLogging) return;

      const logLevel = this.config.logLevel || 'info';
      const levels = { debug: 0, info: 1, warn: 2, error: 3 };

      if (levels[level as keyof typeof levels] < levels[logLevel as keyof typeof levels]) {
        return;
      }

      const timestamp = new Date().toISOString();
      const logData = {
        timestamp,
        level,
        message,
        service: 'AIService',
        ...data,
      };

      if (level === 'error') {
        console.error(`[${timestamp}] ${level.toUpperCase()}: ${message}`, logData);
      } else if (level === 'warn') {
        console.warn(`[${timestamp}] ${level.toUpperCase()}: ${message}`, logData);
      } else {
        console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, logData);
      }
    };
  }

  private isRetryableError(error: Error): boolean {
    return error.message.includes('timeout') ||
      error.message.includes('ECONNRESET') ||
      error.message.includes('ENOTFOUND') ||
      error.message.includes('ETIMEDOUT');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance for system-wide access
let aiServiceInstance: AIService | null = null;

export function getAIService(config?: Partial<AIServiceConfig>): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService(config);
  }
  return aiServiceInstance;
}

export function createAIService(config?: Partial<AIServiceConfig>): AIService {
  return new AIService(config);
}

// Types are already exported above as interfaces
