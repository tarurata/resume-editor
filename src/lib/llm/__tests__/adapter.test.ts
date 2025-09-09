import { LLMAdapterImpl } from '../adapter';
import { MockProvider } from '../providers';
import { LLMError, LLMTimeoutError } from '../errors';

// Mock the providers module
jest.mock('../providers', () => ({
  createProvider: jest.fn(() => ({
    validateConfig: jest.fn(),
    generate: jest.fn(),
  })),
  MockProvider: jest.fn().mockImplementation(() => ({
    validateConfig: jest.fn(),
    generate: jest.fn(),
  })),
}));

describe('LLMAdapterImpl', () => {
  let adapter: LLMAdapterImpl;
  let mockProvider: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProvider = {
      validateConfig: jest.fn(),
      generate: jest.fn().mockResolvedValue({
        text: 'Mock response',
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: 'mock-model',
        finishReason: 'stop',
      }),
    };
    
    // Mock the createProvider function to return our mock
    const { createProvider } = require('../providers');
    (createProvider as jest.Mock).mockReturnValue(mockProvider);
    
    adapter = new LLMAdapterImpl({
      provider: 'mock',
      timeout: 1000,
      maxRetries: 2,
      retryDelay: 100,
      maxTokens: 1000,
    });
  });

  describe('generate', () => {
    it('should generate a response successfully', async () => {
      const response = await adapter.generate('Test prompt');
      
      expect(response.text).toBe('Mock response');
      expect(response.usage).toEqual({
        promptTokens: 10,
        completionTokens: 5,
        totalTokens: 15,
      });
      expect(mockProvider.generate).toHaveBeenCalledWith(
        'Test prompt',
        expect.objectContaining({
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 1000,
        }),
        expect.any(Object)
      );
    });

    it('should merge params with defaults', async () => {
      await adapter.generate('Test prompt', {
        temperature: 0.5,
        maxTokens: 500,
        model: 'custom-model',
      });

      expect(mockProvider.generate).toHaveBeenCalledWith(
        'Test prompt',
        expect.objectContaining({
          model: 'custom-model',
          temperature: 0.5,
          maxTokens: 500,
        }),
        expect.any(Object)
      );
    });

    it('should validate token limits', async () => {
      await expect(
        adapter.generate('Test prompt', { maxTokens: 2000 })
      ).rejects.toThrow('Requested maxTokens (2000) exceeds configured limit (1000)');
    });

    it('should retry on retryable errors', async () => {
      const retryableError = new LLMError('Network error', 'mock', 500, true);
      mockProvider.generate
        .mockRejectedValueOnce(retryableError)
        .mockRejectedValueOnce(retryableError)
        .mockResolvedValueOnce({
          text: 'Success after retry',
          usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
          model: 'mock-model',
          finishReason: 'stop',
        });

      const response = await adapter.generate('Test prompt');
      
      expect(response.text).toBe('Success after retry');
      expect(mockProvider.generate).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable errors', async () => {
      const nonRetryableError = new LLMError('Invalid request', 'mock', 400, false);
      mockProvider.generate.mockRejectedValue(nonRetryableError);

      await expect(adapter.generate('Test prompt')).rejects.toThrow('Invalid request');
      expect(mockProvider.generate).toHaveBeenCalledTimes(1);
    });

    it('should throw after max retries', async () => {
      const retryableError = new LLMError('Network error', 'mock', 500, true);
      mockProvider.generate.mockRejectedValue(retryableError);

      await expect(adapter.generate('Test prompt')).rejects.toThrow('Network error');
      expect(mockProvider.generate).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    });

    it('should timeout long-running requests', async () => {
      mockProvider.generate.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 2000))
      );

      await expect(adapter.generate('Test prompt')).rejects.toThrow('Request timed out after 1000ms');
    });
  });

  describe('telemetry', () => {
    it('should emit telemetry on success', async () => {
      const telemetryHook = jest.fn();
      adapter.addTelemetryHook(telemetryHook);

      await adapter.generate('Test prompt');

      expect(telemetryHook).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          provider: 'mock',
          retryCount: 0,
        })
      );
    });

    it('should emit telemetry on retry', async () => {
      const telemetryHook = jest.fn();
      adapter.addTelemetryHook(telemetryHook);

      const retryableError = new LLMError('Network error', 'mock', 500, true);
      mockProvider.generate
        .mockRejectedValueOnce(retryableError)
        .mockResolvedValueOnce({
          text: 'Success after retry',
          usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
          model: 'mock-model',
          finishReason: 'stop',
        });

      await adapter.generate('Test prompt');

      expect(telemetryHook).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'retry',
          provider: 'mock',
          retryCount: 1,
          error: 'Network error',
        })
      );
    });

    it('should emit telemetry on error', async () => {
      const telemetryHook = jest.fn();
      adapter.addTelemetryHook(telemetryHook);

      const error = new LLMError('Invalid request', 'mock', 400, false);
      mockProvider.generate.mockRejectedValue(error);

      await expect(adapter.generate('Test prompt')).rejects.toThrow();

      expect(telemetryHook).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          provider: 'mock',
          retryCount: 0,
          error: 'Invalid request',
        })
      );
    });

    it('should handle telemetry hook errors gracefully', async () => {
      const errorHook = jest.fn(() => {
        throw new Error('Telemetry hook error');
      });
      const normalHook = jest.fn();
      
      adapter.addTelemetryHook(errorHook);
      adapter.addTelemetryHook(normalHook);

      // Should not throw even if telemetry hook fails
      await expect(adapter.generate('Test prompt')).resolves.toBeDefined();
      expect(normalHook).toHaveBeenCalled();
    });
  });

  describe('retry delay calculation', () => {
    it('should use exponential backoff with jitter', async () => {
      const retryableError = new LLMError('Network error', 'mock', 500, true);
      mockProvider.generate.mockRejectedValue(retryableError);

      const startTime = Date.now();
      await expect(adapter.generate('Test prompt')).rejects.toThrow();
      const duration = Date.now() - startTime;

      // Should have waited for retries (at least 100ms + 200ms = 300ms)
      expect(duration).toBeGreaterThan(300);
    });
  });

  describe('configuration', () => {
    it('should return current configuration', () => {
      const config = adapter.getConfig();
      
      expect(config).toEqual({
        provider: 'mock',
        timeout: 1000,
        maxRetries: 2,
        retryDelay: 100,
        maxTokens: 1000,
      });
    });
  });
});
