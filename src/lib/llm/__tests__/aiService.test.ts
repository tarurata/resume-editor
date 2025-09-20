import { AIService, createAIService, getAIService } from '../aiService';
import { RateLimiter } from '../rateLimiter';

// Mock the LLM adapter
jest.mock('../adapter', () => ({
  createLLMAdapter: jest.fn(() => ({
    generate: jest.fn(),
    getConfig: jest.fn(),
    addTelemetryHook: jest.fn(),
  })),
}));

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should create AIService instance', () => {
      const aiService = createAIService({
        provider: 'mock',
        maxTokens: 1000,
      });
      
      expect(aiService).toBeInstanceOf(AIService);
    });

    it('should get singleton instance', () => {
      const aiService1 = getAIService();
      const aiService2 = getAIService();
      
      expect(aiService1).toBe(aiService2);
    });
  });

  describe('Configuration', () => {
    it('should use default configuration', () => {
      const aiService = createAIService();
      const config = aiService.getConfig();
      
      expect(config.provider).toBe('mock');
      expect(config.maxTokens).toBe(4000);
      expect(config.enableLogging).toBe(true);
    });

    it('should update configuration', () => {
      const aiService = createAIService();
      
      aiService.updateConfig({
        maxTokens: 2000,
        enableLogging: false,
      });
      
      const config = aiService.getConfig();
      expect(config.maxTokens).toBe(2000);
      expect(config.enableLogging).toBe(false);
    });
  });

  describe('Rate limiting', () => {
    it('should check rate limit status', () => {
      const aiService = createAIService();
      const status = aiService.getRateLimitStatus({ userId: 'test-user' });
      
      expect(status).toHaveProperty('remainingRequests');
      expect(status).toHaveProperty('remainingTokens');
      expect(status).toHaveProperty('timeUntilReset');
      expect(typeof status.remainingRequests).toBe('number');
      expect(typeof status.remainingTokens).toBe('number');
      expect(typeof status.timeUntilReset).toBe('number');
    });
  });
});

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      maxRequests: 5,
      windowMs: 60000, // 1 minute
      maxTokensPerWindow: 1000,
      maxTokensPerRequest: 100,
    });
  });

  describe('Basic functionality', () => {
    it('should allow requests within limits', async () => {
      const canProceed = await rateLimiter.checkLimit('test-key', 50);
      expect(canProceed).toBe(true);
    });

    it('should record requests', async () => {
      await rateLimiter.recordRequest('test-key', 50);
      const remaining = rateLimiter.getRemainingRequests('test-key');
      expect(remaining).toBe(4); // 5 - 1 = 4
    });

    it('should enforce request limits', async () => {
      // Exceed request limit
      for (let i = 0; i < 5; i++) {
        await rateLimiter.recordRequest('test-key', 10);
      }
      
      const canProceed = await rateLimiter.checkLimit('test-key', 10);
      expect(canProceed).toBe(false);
    });

    it('should enforce token limits', async () => {
      const canProceed = await rateLimiter.checkLimit('test-key', 1001);
      expect(canProceed).toBe(false);
    });
  });

  describe('Time windows', () => {
    it('should reset limits after window expires', async () => {
      // Use up all requests
      for (let i = 0; i < 5; i++) {
        await rateLimiter.recordRequest('test-key', 10);
      }
      
      // Should be at limit
      let canProceed = await rateLimiter.checkLimit('test-key', 10);
      expect(canProceed).toBe(false);
      
      // Fast forward time (simulate)
      const originalNow = Date.now;
      Date.now = jest.fn(() => originalNow() + 61000); // 61 seconds later
      
      // Should be able to make requests again
      canProceed = await rateLimiter.checkLimit('test-key', 10);
      expect(canProceed).toBe(true);
      
      // Restore original Date.now
      Date.now = originalNow;
    });
  });
});
