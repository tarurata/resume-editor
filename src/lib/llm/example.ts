import { createLLMAdapter } from './adapter';
import { LLMTelemetry } from './types';

// Example usage of the LLM adapter
export async function exampleUsage() {
  // Create adapter with default configuration (uses environment variables)
  const adapter = createLLMAdapter();

  // Add telemetry hook to track usage
  adapter.addTelemetryHook((telemetry: LLMTelemetry) => {
    console.log('LLM Telemetry:', {
      provider: telemetry.provider,
      status: telemetry.status,
      duration: `${telemetry.duration}ms`,
      tokens: telemetry.tokens,
      retryCount: telemetry.retryCount,
    });
  });

  try {
    // Basic usage
    const response = await adapter.generate('Write a professional summary for a software engineer');
    console.log('Response:', response.text);

    // With custom parameters
    const customResponse = await adapter.generate(
      'Help me improve this resume section',
      {
        temperature: 0.3,
        maxTokens: 500,
        model: 'gpt-4',
      }
    );
    console.log('Custom response:', customResponse.text);

    // Batch processing example
    const prompts = [
      'Write a cover letter for a software engineer position',
      'Suggest improvements for this job description',
      'Help me format this resume section',
    ];

    const responses = await Promise.all(
      prompts.map(prompt => adapter.generate(prompt))
    );

    responses.forEach((response, index) => {
      console.log(`Response ${index + 1}:`, response.text.substring(0, 100) + '...');
    });

  } catch (error) {
    console.error('LLM Error:', error);
  }
}

// Example with custom configuration
export async function exampleWithCustomConfig() {
  const adapter = createLLMAdapter({
    provider: 'openai',
    apiKey: 'your-api-key-here',
    timeout: 60000,
    maxRetries: 5,
    retryDelay: 2000,
    maxTokens: 8000,
  });

  try {
    const response = await adapter.generate(
      'Analyze this resume and suggest improvements',
      {
        temperature: 0.7,
        maxTokens: 2000,
      }
    );

    console.log('Analysis:', response.text);
    console.log('Token usage:', response.usage);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example with different providers
export async function exampleWithProviders() {
  // Mock provider for testing
  const mockAdapter = createLLMAdapter({ provider: 'mock' });
  
  // OpenAI provider
  const openaiAdapter = createLLMAdapter({
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Anthropic provider
  const anthropicAdapter = createLLMAdapter({
    provider: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const prompt = 'Write a professional summary for a data scientist';

  try {
    // Test with mock provider
    const mockResponse = await mockAdapter.generate(prompt);
    console.log('Mock response:', mockResponse.text);

    // Test with OpenAI (if API key is available)
    if (process.env.OPENAI_API_KEY) {
      const openaiResponse = await openaiAdapter.generate(prompt);
      console.log('OpenAI response:', openaiResponse.text);
    }

    // Test with Anthropic (if API key is available)
    if (process.env.ANTHROPIC_API_KEY) {
      const anthropicResponse = await anthropicAdapter.generate(prompt);
      console.log('Anthropic response:', anthropicResponse.text);
    }

  } catch (error) {
    console.error('Provider error:', error);
  }
}
