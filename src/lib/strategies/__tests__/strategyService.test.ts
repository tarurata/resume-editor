import { StrategyService } from '../strategyService';
import { MockProvider } from '../../llm/providers/mock';
import { StrategyRequest } from '../types';

describe('StrategyService', () => {
  let strategyService: StrategyService;
  let mockProvider: MockProvider;

  beforeEach(() => {
    mockProvider = new MockProvider();
    strategyService = new StrategyService(mockProvider);
  });

  describe('generateSuggestion', () => {
    it('should generate suggestion for title extraction', async () => {
      const request: StrategyRequest = {
        sectionId: 'title_0',
        sectionType: 'title',
        strategyId: 'extract-from-jd',
        currentContent: 'Software Developer',
        jdText: 'We are looking for a Senior Software Engineer - Full Stack to join our team...'
      };

      const response = await strategyService.generateSuggestion(request);

      expect(response.sectionId).toBe('title_0');
      expect(response.strategyId).toBe('extract-from-jd');
      expect(response.suggestion).toBeDefined();
      expect(response.wordCount).toBeGreaterThan(0);
    });

    it('should generate suggestion for summary rewrite with word cap', async () => {
      const request: StrategyRequest = {
        sectionId: 'summary_0',
        sectionType: 'summary',
        strategyId: 'rewrite-short',
        currentContent: 'I am a software engineer with many years of experience',
        jdText: 'We are looking for a passionate Software Engineer...'
      };

      const response = await strategyService.generateSuggestion(request);

      expect(response.sectionId).toBe('summary_0');
      expect(response.strategyId).toBe('rewrite-short');
      expect(response.suggestion).toBeDefined();
      expect(response.wordCount).toBeLessThanOrEqual(50);
    });

    it('should handle empty job description gracefully', async () => {
      const request: StrategyRequest = {
        sectionId: 'title_0',
        sectionType: 'title',
        strategyId: 'extract-from-jd',
        currentContent: 'Software Developer',
        jdText: ''
      };

      await expect(strategyService.generateSuggestion(request))
        .rejects.toThrow('Job description is too short or missing');
    });

    it('should handle short job description gracefully', async () => {
      const request: StrategyRequest = {
        sectionId: 'title_0',
        sectionType: 'title',
        strategyId: 'extract-from-jd',
        currentContent: 'Software Developer',
        jdText: 'Software Engineer'
      };

      await expect(strategyService.generateSuggestion(request))
        .rejects.toThrow('Job description is too short or missing');
    });

    it('should handle invalid strategy gracefully', async () => {
      const request: StrategyRequest = {
        sectionId: 'title_0',
        sectionType: 'title',
        strategyId: 'invalid-strategy',
        currentContent: 'Software Developer',
        jdText: 'We are looking for a Software Engineer...'
      };

      await expect(strategyService.generateSuggestion(request))
        .rejects.toThrow('Strategy invalid-strategy not found for section type title');
    });

    it('should work for strategies that do not require JD', async () => {
      const request: StrategyRequest = {
        sectionId: 'experience_0',
        sectionType: 'experience',
        strategyId: 'action-verbs',
        currentContent: 'Did development work on microservices',
        jdText: undefined
      };

      const response = await strategyService.generateSuggestion(request);

      expect(response.sectionId).toBe('experience_0');
      expect(response.strategyId).toBe('action-verbs');
      expect(response.suggestion).toBeDefined();
    });
  });
});
