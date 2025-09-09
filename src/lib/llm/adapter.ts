import { LLMAdapter, LLMConfig, LLMParams, LLMResponse, LLMTelemetry, LLMProvider } from './types';
import { getLLMConfig, validateLLMConfig } from './config';
import { LLMError, isRetryableError } from './errors';
import { createProvider } from './providers';

export class LLMAdapterImpl implements LLMAdapter {
  private config: LLMConfig;
  private provider: LLMProvider;
  private telemetryHooks: ((telemetry: LLMTelemetry) => void)[] = [];

  constructor(config?: Partial<LLMConfig>) {
    this.config = { ...getLLMConfig(), ...config };
    validateLLMConfig(this.config);
    this.provider = createProvider(this.config.provider);
  }

  async generate(prompt: string, params: LLMParams = {}): Promise<LLMResponse> {
    const startTime = Date.now();
    let lastError: Error | null = null;
    let retryCount = 0;

    // Merge params with defaults
    const mergedParams: LLMParams = {
      model: this.config.provider === 'openai' ? 'gpt-3.5-turbo' : 'claude-3-sonnet',
      temperature: 0.7,
      maxTokens: this.config.maxTokens,
      ...params,
    };

    // Validate token limits
    if (mergedParams.maxTokens && mergedParams.maxTokens > this.config.maxTokens!) {
      throw new LLMError(
        `Requested maxTokens (${mergedParams.maxTokens}) exceeds configured limit (${this.config.maxTokens})`,
        this.config.provider,
        400
      );
    }

    while (retryCount <= this.config.maxRetries!) {
      try {
        const response = await this.executeWithTimeout(
          this.provider.generate(prompt, mergedParams, this.config),
          this.config.timeout!
        );

        const duration = Date.now() - startTime;
        this.emitTelemetry({
          duration,
          status: 'success',
          provider: this.config.provider,
          model: mergedParams.model,
          tokens: response.usage,
          retryCount,
        });

        return response;
      } catch (error) {
        lastError = error as Error;
        const duration = Date.now() - startTime;

        if (retryCount === this.config.maxRetries! || !isRetryableError(lastError)) {
          this.emitTelemetry({
            duration,
            status: 'error',
            provider: this.config.provider,
            model: mergedParams.model,
            retryCount,
            error: lastError.message,
          });
          throw lastError;
        }

        retryCount++;
        const delay = this.calculateRetryDelay(retryCount);
        
        this.emitTelemetry({
          duration,
          status: 'retry',
          provider: this.config.provider,
          model: mergedParams.model,
          retryCount,
          error: lastError.message,
        });

        await this.sleep(delay);
      }
    }

    throw lastError || new LLMError('Max retries exceeded', this.config.provider);
  }

  getConfig(): LLMConfig {
    return { ...this.config };
  }

  addTelemetryHook(hook: (telemetry: LLMTelemetry) => void): void {
    this.telemetryHooks.push(hook);
  }

  removeTelemetryHook(hook: (telemetry: LLMTelemetry) => void): void {
    const index = this.telemetryHooks.indexOf(hook);
    if (index > -1) {
      this.telemetryHooks.splice(index, 1);
    }
  }

  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new LLMError(`Request timed out after ${timeoutMs}ms`, this.config.provider, 408, true));
        }, timeoutMs);
      }),
    ]);
  }

  private calculateRetryDelay(retryCount: number): number {
    // Exponential backoff with jitter
    const baseDelay = this.config.retryDelay!;
    const exponentialDelay = baseDelay * Math.pow(2, retryCount - 1);
    const jitter = Math.random() * 0.1 * exponentialDelay;
    return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private emitTelemetry(telemetry: LLMTelemetry): void {
    this.telemetryHooks.forEach(hook => {
      try {
        hook(telemetry);
      } catch (error) {
        console.error('Telemetry hook error:', error);
      }
    });
  }
}

export function createLLMAdapter(config?: Partial<LLMConfig>): LLMAdapter {
  return new LLMAdapterImpl(config);
}
