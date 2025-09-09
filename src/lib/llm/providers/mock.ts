import { LLMProvider, LLMConfig, LLMParams, LLMResponse } from '../types';
import { validateLLMConfig } from '../config';

export class MockProvider implements LLMProvider {
  validateConfig(config: LLMConfig): void {
    // Mock provider doesn't need API keys
    if (config.provider !== 'mock') {
      throw new Error('MockProvider requires provider to be "mock"');
    }
  }

  async generate(prompt: string, params: LLMParams, config: LLMConfig): Promise<LLMResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    // Generate a mock response based on the prompt
    const mockResponse = this.generateMockResponse(prompt, params);
    
    return {
      text: mockResponse,
      usage: {
        promptTokens: this.estimateTokens(prompt),
        completionTokens: this.estimateTokens(mockResponse),
        totalTokens: this.estimateTokens(prompt) + this.estimateTokens(mockResponse),
      },
      model: params.model || 'mock-model',
      finishReason: 'stop',
    };
  }

  private generateMockResponse(prompt: string, params: LLMParams): string {
    // Simple mock responses based on prompt content
    if (prompt.toLowerCase().includes('resume') || prompt.toLowerCase().includes('cv')) {
      return `Here's a professional resume suggestion based on your input:

**Professional Summary**
Experienced professional with strong skills in [relevant field]. Proven track record of delivering results and driving innovation.

**Key Skills**
- Strategic planning and execution
- Team leadership and collaboration
- Problem-solving and analytical thinking
- Communication and presentation skills

**Experience**
[Previous roles with quantified achievements]

**Education**
[Relevant degrees and certifications]

This structure follows ATS-friendly formatting and highlights your most relevant qualifications.`;
    }

    if (prompt.toLowerCase().includes('cover letter')) {
      return `Here's a professional cover letter template:

Dear Hiring Manager,

I am writing to express my strong interest in the [Position Title] role at [Company Name]. With my background in [relevant field] and proven track record of [key achievements], I am confident that I would be a valuable addition to your team.

In my current role at [Current Company], I have successfully [specific accomplishment with metrics]. This experience has equipped me with the skills and knowledge necessary to excel in this position.

I am particularly drawn to [Company Name] because of [specific reason related to company values/mission]. I am excited about the opportunity to contribute to your team and help drive [specific company goal].

Thank you for considering my application. I look forward to discussing how my skills and experience can benefit your organization.

Best regards,
[Your Name]`;
    }

    // Default mock response
    return `This is a mock response to your prompt: "${prompt.substring(0, 100)}..."

I'm a mock LLM provider designed for testing and development. In a real implementation, this would be replaced with actual API calls to services like OpenAI or Anthropic.

Key features of this mock:
- Simulates realistic response times
- Provides contextually relevant responses
- Includes token usage estimates
- Supports various prompt types

For production use, configure a real provider like OpenAI or Anthropic.`;
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}
