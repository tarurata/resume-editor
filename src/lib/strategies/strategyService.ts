import { StrategyLibrary, StrategyPrompt, StrategyRequest, StrategyResponse } from './types';
import { LLMAdapter } from '../llm/types';
import prompts from './prompts.json';

export class StrategyService {
  private llmAdapter: LLMAdapter;
  private promptLibrary: StrategyLibrary;

  constructor(llmAdapter: LLMAdapter) {
    this.llmAdapter = llmAdapter;
    this.promptLibrary = prompts as StrategyLibrary;
  }

  async generateSuggestion(request: StrategyRequest): Promise<StrategyResponse> {
    // Validate strategy exists
    const strategy = this.getStrategy(request.sectionType, request.strategyId);
    if (!strategy) {
      throw new Error(`Strategy ${request.strategyId} not found for section type ${request.sectionType}`);
    }

    // Validate JD requirement
    if (this.requiresJD(strategy) && (!request.jdText || request.jdText.trim().length < 50)) {
      throw new Error('Job description is too short or missing. Please provide more details about the role.');
    }

    // Generate prompt with variable substitution
    const prompt = this.substituteVariables(strategy.prompt, {
      currentContent: request.currentContent,
      jdText: request.jdText || '',
      ...request.constraints
    });

    // Call LLM
    const response = await this.llmAdapter.generate(prompt);

    // Parse and validate output
    const suggestion = this.parseOutput(response.text, request.sectionType);
    
    // Apply word count constraints
    const finalSuggestion = this.applyConstraints(suggestion, strategy.constraints);

    return {
      sectionId: request.sectionId,
      suggestion: finalSuggestion,
      strategyId: request.strategyId,
      wordCount: this.countWords(finalSuggestion)
    };
  }

  private getStrategy(sectionType: string, strategyId: string): StrategyPrompt | null {
    return this.promptLibrary[sectionType]?.[strategyId] || null;
  }

  private requiresJD(strategy: StrategyPrompt): boolean {
    return strategy.variables.includes('jdText');
  }

  private substituteVariables(prompt: string, variables: Record<string, any>): string {
    let result = prompt;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value || ''));
    }
    return result;
  }

  private parseOutput(output: string, sectionType: string): string {
    // Clean up the output - remove extra text and formatting
    let cleaned = output.trim();
    
    // Remove common prefixes
    const prefixes = [
      'Here\'s the suggestion:',
      'Here is the suggestion:',
      'Suggestion:',
      'Result:',
      'Output:',
      'Here\'s the result:',
      'Here is the result:'
    ];
    
    for (const prefix of prefixes) {
      if (cleaned.startsWith(prefix)) {
        cleaned = cleaned.substring(prefix.length).trim();
        break;
      }
    }

    // For experience and skills, split into lines and clean each
    if (sectionType === 'experience' || sectionType === 'skills') {
      const lines = cleaned.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => line.replace(/^[-•*]\s*/, '')) // Remove bullet points
        .map(line => line.replace(/^\d+\.\s*/, '')); // Remove numbering
      
      return lines.join('\n');
    }

    return cleaned;
  }

  private applyConstraints(suggestion: string, constraints?: Record<string, any>): string {
    if (!constraints?.maxWords) {
      return suggestion;
    }

    const words = suggestion.split(/\s+/);
    if (words.length <= constraints.maxWords) {
      return suggestion;
    }

    // Trim to word limit
    return words.slice(0, constraints.maxWords).join(' ');
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }
}
