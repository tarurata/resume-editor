import { MockProvider } from '../providers/mock';
import { OpenAIProvider } from '../providers/openai';
import { AnthropicProvider } from '../providers/anthropic';
import { LLMError, LLMAuthenticationError, LLMInvalidRequestError } from '../errors';

// Mock fetch for testing
global.fetch = jest.fn();

describe('MockProvider', () => {
  let provider: MockProvider;

  beforeEach(() => {
    provider = new MockProvider();
  });

  it('should validate config correctly', () => {
    expect(() => provider.validateConfig({ provider: 'mock' })).not.toThrow();
    expect(() => provider.validateConfig({ provider: 'openai' })).toThrow();
  });

  it('should generate mock responses', async () => {
    const response = await provider.generate('Test prompt', {}, { provider: 'mock' });
    
    expect(response.text).toBeDefined();
    expect(response.usage).toBeDefined();
    expect(response.model).toBe('mock-model');
    expect(response.finishReason).toBe('stop');
  });

  it('should generate contextually relevant responses for resume prompts', async () => {
    const response = await provider.generate('Help me write a resume', {}, { provider: 'mock' });
    
    expect(response.text).toContain('resume');
    expect(response.text).toContain('Professional Summary');
  });

  it('should estimate tokens correctly', async () => {
    const response = await provider.generate('Short prompt', {}, { provider: 'mock' });
    
    expect(response.usage?.promptTokens).toBeGreaterThan(0);
    expect(response.usage?.completionTokens).toBeGreaterThan(0);
    expect(response.usage?.totalTokens).toBe(
      (response.usage?.promptTokens || 0) + (response.usage?.completionTokens || 0)
    );
  });
});

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    provider = new OpenAIProvider();
    mockFetch.mockClear();
  });

  it('should validate config correctly', () => {
    expect(() => provider.validateConfig({ 
      provider: 'openai', 
      apiKey: 'test-key' 
    })).not.toThrow();
    
    expect(() => provider.validateConfig({ 
      provider: 'openai' 
    })).toThrow('OpenAI API key is required');
    
    expect(() => provider.validateConfig({ 
      provider: 'anthropic', 
      apiKey: 'test-key' 
    })).toThrow('OpenAIProvider requires provider to be "openai"');
  });

  it('should make correct API request', async () => {
    const mockResponse = {
      choices: [{ message: { content: 'Test response' } }],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      model: 'gpt-3.5-turbo',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const response = await provider.generate(
      'Test prompt',
      { temperature: 0.5, maxTokens: 100 },
      { provider: 'openai', apiKey: 'test-key' }
    );

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test prompt' }],
          temperature: 0.5,
          max_tokens: 100,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
          stop: undefined,
        }),
      })
    );

    expect(response.text).toBe('Test response');
    expect(response.usage).toEqual({
      promptTokens: 10,
      completionTokens: 5,
      totalTokens: 15,
    });
  });

  it('should handle authentication errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Invalid API key' } }),
    } as Response);

    await expect(
      provider.generate('Test prompt', {}, { provider: 'openai', apiKey: 'invalid-key' })
    ).rejects.toThrow(LLMAuthenticationError);
  });

  it('should handle rate limit errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      headers: new Headers({ 'retry-after': '60' }),
      json: async () => ({ error: { message: 'Rate limit exceeded' } }),
    } as Response);

    await expect(
      provider.generate('Test prompt', {}, { provider: 'openai', apiKey: 'test-key' })
    ).rejects.toThrow('Rate limit exceeded, retry after 60s');
  });
});

describe('AnthropicProvider', () => {
  let provider: AnthropicProvider;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    provider = new AnthropicProvider();
    mockFetch.mockClear();
  });

  it('should validate config correctly', () => {
    expect(() => provider.validateConfig({ 
      provider: 'anthropic', 
      apiKey: 'test-key' 
    })).not.toThrow();
    
    expect(() => provider.validateConfig({ 
      provider: 'anthropic' 
    })).toThrow('Anthropic API key is required');
    
    expect(() => provider.validateConfig({ 
      provider: 'openai', 
      apiKey: 'test-key' 
    })).toThrow('AnthropicProvider requires provider to be "anthropic"');
  });

  it('should make correct API request', async () => {
    const mockResponse = {
      content: [{ text: 'Test response' }],
      usage: { input_tokens: 10, output_tokens: 5 },
      model: 'claude-3-sonnet-20240229',
      stop_reason: 'end_turn',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const response = await provider.generate(
      'Test prompt',
      { temperature: 0.5, maxTokens: 100 },
      { provider: 'anthropic', apiKey: 'test-key' }
    );

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/messages',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'x-api-key': 'test-key',
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 100,
          temperature: 0.5,
          top_p: 1,
          stop_sequences: [],
          messages: [{ role: 'user', content: 'Test prompt' }],
        }),
      })
    );

    expect(response.text).toBe('Test response');
    expect(response.usage).toEqual({
      promptTokens: 10,
      completionTokens: 5,
      totalTokens: 15,
    });
  });

  it('should handle authentication errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Invalid API key' } }),
    } as Response);

    await expect(
      provider.generate('Test prompt', {}, { provider: 'anthropic', apiKey: 'invalid-key' })
    ).rejects.toThrow(LLMAuthenticationError);
  });
});
