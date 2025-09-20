/**
 * Integration Example: How to use the AI service throughout the resume editor
 * 
 * This file demonstrates how different features in the resume editor can
 * use the centralized AI service for various tasks.
 */

import { getAIService, AIServiceOptions } from './aiService';

// Example 1: Resume improvement feature
export class ResumeImprovementService {
  private aiService = getAIService();

  async improveSection(section: string, context: string, userId: string): Promise<string> {
    const prompt = `Improve this resume section to be more professional and impactful:
    
    Section: ${section}
    Context: ${context}
    
    Please provide an improved version that:
    - Uses action verbs
    - Includes quantifiable achievements
    - Is ATS-friendly
    - Maintains professional tone`;

    const options: AIServiceOptions = {
      userId,
      feature: 'resume-improvement',
      metadata: { section: 'experience' }
    };

    const response = await this.aiService.generate(prompt, {
      maxTokens: 300,
      temperature: 0.7
    }, options);

    return response.text;
  }

  async generateProfessionalSummary(experience: string[], skills: string[], userId: string): Promise<string> {
    const prompt = `Create a professional summary for a resume based on:
    
    Experience: ${experience.join(', ')}
    Skills: ${skills.join(', ')}
    
    Write a 2-3 sentence professional summary that highlights key qualifications.`;

    const options: AIServiceOptions = {
      userId,
      feature: 'professional-summary',
    };

    const response = await this.aiService.generate(prompt, {
      maxTokens: 150,
      temperature: 0.8
    }, options);

    return response.text;
  }
}

// Example 2: Cover letter generation
export class CoverLetterService {
  private aiService = getAIService();

  async generateCoverLetter(
    jobDescription: string,
    resumeData: any,
    userId: string
  ): Promise<string> {
    const prompt = `Generate a professional cover letter based on:
    
    Job Description: ${jobDescription}
    Candidate Experience: ${JSON.stringify(resumeData, null, 2)}
    
    Create a compelling cover letter that:
    - Addresses key requirements from the job description
    - Highlights relevant experience
    - Shows enthusiasm for the role
    - Is personalized and specific`;

    const options: AIServiceOptions = {
      userId,
      feature: 'cover-letter-generation',
    };

    const response = await this.aiService.generate(prompt, {
      maxTokens: 800,
      temperature: 0.7
    }, options);

    return response.text;
  }
}

// Example 3: Skills optimization
export class SkillsOptimizationService {
  private aiService = getAIService();

  async optimizeSkillsForJob(
    currentSkills: string[],
    jobDescription: string,
    userId: string
  ): Promise<{ optimized: string[], missing: string[] }> {
    const prompt = `Analyze these skills against the job description and provide optimization suggestions:
    
    Current Skills: ${currentSkills.join(', ')}
    Job Description: ${jobDescription}
    
    Return a JSON response with:
    - "optimized": Array of improved skill descriptions
    - "missing": Array of important skills mentioned in the job that are missing
    - "suggestions": Array of additional skills to consider`;

    const options: AIServiceOptions = {
      userId,
      feature: 'skills-optimization',
    };

    const response = await this.aiService.generate(prompt, {
      maxTokens: 500,
      temperature: 0.6
    }, options);

    try {
      return JSON.parse(response.text);
    } catch {
      // Fallback if JSON parsing fails
      return {
        optimized: currentSkills,
        missing: [],
        suggestions: []
      };
    }
  }
}

// Example 4: ATS optimization
export class ATSOptimizationService {
  private aiService = getAIService();

  async optimizeForATS(resumeText: string, jobDescription: string, userId: string): Promise<string> {
    const prompt = `Optimize this resume for ATS (Applicant Tracking System) compatibility:
    
    Resume Text: ${resumeText}
    Target Job: ${jobDescription}
    
    Please:
    1. Ensure ATS-friendly formatting
    2. Include relevant keywords from the job description
    3. Use standard section headers
    4. Avoid graphics, tables, or complex formatting
    5. Use standard fonts and formatting`;

    const options: AIServiceOptions = {
      userId,
      feature: 'ats-optimization',
    };

    const response = await this.aiService.generate(prompt, {
      maxTokens: 1000,
      temperature: 0.5
    }, options);

    return response.text;
  }
}

// Example 5: Resume analysis and feedback
export class ResumeAnalysisService {
  private aiService = getAIService();

  async analyzeResume(resumeData: any, userId: string): Promise<{
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    score: number;
  }> {
    const prompt = `Analyze this resume and provide detailed feedback:
    
    Resume Data: ${JSON.stringify(resumeData, null, 2)}
    
    Provide a JSON response with:
    - "strengths": Array of what the resume does well
    - "weaknesses": Array of areas for improvement
    - "suggestions": Array of specific actionable recommendations
    - "score": Overall score from 1-10`;

    const options: AIServiceOptions = {
      userId,
      feature: 'resume-analysis',
    };

    const response = await this.aiService.generate(prompt, {
      maxTokens: 600,
      temperature: 0.6
    }, options);

    try {
      return JSON.parse(response.text);
    } catch {
      // Fallback response
      return {
        strengths: ['Well-structured format'],
        weaknesses: ['Could use more quantifiable achievements'],
        suggestions: ['Add specific metrics to your accomplishments'],
        score: 7
      };
    }
  }
}

// Example 6: Usage in React components (conceptual)
export const useAIService = () => {
  const aiService = getAIService();
  
  return {
    // Check if AI is available and rate limits
    isAvailable: () => {
      const status = aiService.getRateLimitStatus();
      return status.remainingRequests > 0;
    },
    
    // Get rate limit status for UI display
    getRateLimitStatus: () => aiService.getRateLimitStatus(),
    
    // Generate content with error handling
    generateContent: async (prompt: string, options?: any) => {
      try {
        return await aiService.generate(prompt, options);
      } catch (error) {
        console.error('AI generation failed:', error);
        throw error;
      }
    }
  };
};

// Example 7: Batch processing for multiple features
export class BatchAIService {
  private aiService = getAIService();

  async processResumeBatch(
    resumeData: any,
    jobDescription: string,
    userId: string
  ): Promise<{
    improvedSections: Record<string, string>;
    coverLetter: string;
    atsOptimized: string;
    analysis: any;
  }> {
    const results: any = {};

    // Process multiple AI tasks in parallel (with rate limiting)
    const tasks = [
      this.improveExperienceSection(resumeData.experience, userId),
      this.generateCoverLetter(jobDescription, resumeData, userId),
      this.optimizeForATS(JSON.stringify(resumeData), jobDescription, userId),
      this.analyzeResume(resumeData, userId)
    ];

    try {
      const [improvedExp, coverLetter, atsOptimized, analysis] = await Promise.all(tasks);
      
      return {
        improvedSections: { experience: improvedExp },
        coverLetter,
        atsOptimized,
        analysis
      };
    } catch (error) {
      console.error('Batch processing failed:', error);
      throw error;
    }
  }

  private async improveExperienceSection(experience: any[], userId: string): Promise<string> {
    // Implementation would go here
    return "Improved experience section";
  }

  private async generateCoverLetter(jobDescription: string, resumeData: any, userId: string): Promise<string> {
    // Implementation would go here
    return "Generated cover letter";
  }

  private async optimizeForATS(resumeText: string, jobDescription: string, userId: string): Promise<string> {
    // Implementation would go here
    return "ATS optimized resume";
  }

  private async analyzeResume(resumeData: any, userId: string): Promise<any> {
    // Implementation would go here
    return { score: 8, suggestions: [] };
  }
}
