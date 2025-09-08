import { LLMProvider, LLMConfig, LLMParams, LLMResponse } from '../types';
import { LLMError, LLMRateLimitError, LLMQuotaExceededError, LLMInvalidRequestError, LLMAuthenticationError } from '../errors';

export class OpenAIProvider implements LLMProvider {
  validateConfig(config: LLMConfig): void {
    if (config.provider !== 'openai') {
      throw new Error('OpenAIProvider requires provider to be "openai"');
    }
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }
  }

  async generate(prompt: string, params: LLMParams, config: LLMConfig): Promise<LLMResponse> {
    this.validateConfig(config);

    const requestBody = {
      model: params.model || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: params.temperature || 0.7,
      max_tokens: params.maxTokens || config.maxTokens || 4000,
      top_p: params.topP || 1,
      frequency_penalty: params.frequencyPenalty || 0,
      presence_penalty: params.presencePenalty || 0,
      stop: params.stop,
    };

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json();
      
      return {
        text: data.choices[0]?.message?.content || '',
        usage: {
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
          totalTokens: data.usage?.total_tokens,
        },
        model: data.model,
        finishReason: data.choices[0]?.finish_reason,
      };
    } catch (error) {
      if (error instanceof LLMError) {
        throw error;
      }
      throw new LLMError(
        `OpenAI API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'openai',
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
        throw new LLMAuthenticationError('openai');
      case 400:
        throw new LLMInvalidRequestError('openai', errorMessage);
      case 429:
        const retryAfter = response.headers.get('retry-after');
        throw new LLMRateLimitError('openai', retryAfter ? parseInt(retryAfter, 10) : undefined);
      case 402:
        throw new LLMQuotaExceededError('openai');
      default:
        throw new LLMError(
          `OpenAI API error (${statusCode}): ${errorMessage}`,
          'openai',
          statusCode,
          statusCode >= 500 || statusCode === 429
        );
    }
  }
}
