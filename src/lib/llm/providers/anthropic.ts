import { LLMProvider, LLMConfig, LLMParams, LLMResponse } from '../types';
import { LLMError, LLMRateLimitError, LLMQuotaExceededError, LLMInvalidRequestError, LLMAuthenticationError } from '../errors';

export class AnthropicProvider implements LLMProvider {
  validateConfig(config: LLMConfig): void {
    if (config.provider !== 'anthropic') {
      throw new Error('AnthropicProvider requires provider to be "anthropic"');
    }
    if (!config.apiKey) {
      throw new Error('Anthropic API key is required');
    }
  }

  async generate(prompt: string, params: LLMParams, config: LLMConfig): Promise<LLMResponse> {
    this.validateConfig(config);

    const requestBody = {
      model: params.model || 'claude-3-sonnet-20240229',
      max_tokens: params.maxTokens || config.maxTokens || 4000,
      temperature: params.temperature || 0.7,
      top_p: params.topP || 1,
      stop_sequences: params.stop || [],
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    };

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': config.apiKey!,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json();
      
      return {
        text: data.content[0]?.text || '',
        usage: {
          promptTokens: data.usage?.input_tokens,
          completionTokens: data.usage?.output_tokens,
          totalTokens: data.usage?.input_tokens + data.usage?.output_tokens,
        },
        model: data.model,
        finishReason: data.stop_reason,
      };
    } catch (error) {
      if (error instanceof LLMError) {
        throw error;
      }
      throw new LLMError(
        `Anthropic API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'anthropic',
        undefined,
        true
      );
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: { message: 'Unknown error' } };
    }

    const errorMessage = errorData.error?.message || 'Unknown error';
    const statusCode = response.status;

    switch (statusCode) {
      case 401:
        throw new LLMAuthenticationError('anthropic');
      case 400:
        throw new LLMInvalidRequestError('anthropic', errorMessage);
      case 429:
        const retryAfter = response.headers.get('retry-after');
        throw new LLMRateLimitError('anthropic', retryAfter ? parseInt(retryAfter, 10) : undefined);
      case 402:
        throw new LLMQuotaExceededError('anthropic');
      default:
        throw new LLMError(
          `Anthropic API error (${statusCode}): ${errorMessage}`,
          'anthropic',
          statusCode,
          statusCode >= 500 || statusCode === 429
        );
    }
  }
}
