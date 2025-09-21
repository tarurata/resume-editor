import { getAIService, createAIService, AIServiceConfig } from './aiService';

// Example 1: Basic usage with singleton
export async function basicExample() {
  const aiService = getAIService();

  try {
    const response = await aiService.generate(
      "Write a professional summary for a software engineer with 5 years of experience"
    );

    console.log('Generated text:', response.text);
    console.log('Tokens used:', response.usage?.totalTokens);

  } catch (error) {
    console.error('Error generating text:', error);
  }
}

// Example 2: Advanced usage with custom configuration
export async function advancedExample() {
  const config: AIServiceConfig = {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    maxTokens: 2000,
    enableLogging: true,
    logLevel: 'debug',
  };

  const aiService = createAIService(config);

  try {
    const response = await aiService.generate(
      "Improve this resume section: 'Worked on various projects'",
      {
        model: 'gpt-4o-mini',
        temperature: 0.8,
        maxTokens: 500
      },
      {
        userId: 'user123',
        feature: 'resume-improvement',
        metadata: { section: 'experience' }
      }
    );

    console.log('Improved text:', response.text);

  } catch (error) {
    console.error('Error improving text:', error);
  }
}

// Example 3: Rate limiting and error handling
export async function rateLimitExample() {
  const aiService = getAIService();

  // Check rate limit status
  const status = aiService.getRateLimitStatus({ userId: 'user123' });
  console.log('Rate limit status:', status);

  try {
    const response = await aiService.generateWithRetry(
      "Generate a cover letter for a marketing position",
      { maxTokens: 1000 },
      { userId: 'user123', feature: 'cover-letter' },
      3 // max retries
    );

    console.log('Generated cover letter:', response.text);

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error after retries:', error.message);
    }
  }
}

// Example 4: Resume-specific features
export async function resumeFeaturesExample() {
  const aiService = getAIService();

  // Generate professional summary
  const summaryResponse = await aiService.generate(
    "Write a professional summary for a data scientist with experience in machine learning and Python",
    { maxTokens: 150 }
  );

  // Improve existing content
  const improvementResponse = await aiService.generate(
    `Improve this job description: "Responsible for data analysis and reporting"`,
    { maxTokens: 200 }
  );

  // Generate skills section
  const skillsResponse = await aiService.generate(
    "List 10 technical skills for a frontend developer",
    { maxTokens: 100 }
  );

  console.log('Professional Summary:', summaryResponse.text);
  console.log('Improved Description:', improvementResponse.text);
  console.log('Skills List:', skillsResponse.text);
}

// Example 5: Batch processing with rate limiting
export async function batchProcessingExample() {
  const aiService = getAIService();
  const prompts = [
    "Write a professional summary for a software engineer",
    "Write a professional summary for a marketing manager",
    "Write a professional summary for a data analyst",
  ];

  const results = [];

  for (const prompt of prompts) {
    try {
      // Check rate limit before each request
      const status = aiService.getRateLimitStatus();
      if (status.remainingRequests === 0) {
        console.log('Rate limit reached, waiting...');
        await new Promise(resolve => setTimeout(resolve, status.timeUntilReset));
      }

      const response = await aiService.generate(prompt, { maxTokens: 200 });
      results.push({ prompt, response: response.text });

    } catch (error) {
      console.error(`Error processing prompt: ${prompt}`, error);
      results.push({ prompt, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  return results;
}

// Example 6: Configuration management
export function configurationExample() {
  const aiService = getAIService();

  // Get current configuration
  const config = aiService.getConfig();
  console.log('Current config:', config);

  // Update configuration
  aiService.updateConfig({
    maxTokens: 3000,
    enableLogging: false,
  });

  console.log('Updated config:', aiService.getConfig());
}

// Run examples (uncomment to test)
// basicExample();
// advancedExample();
// rateLimitExample();
// resumeFeaturesExample();
// batchProcessingExample();
// configurationExample();