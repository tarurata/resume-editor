/**
 * Usage example for the LLM Adapter
 * 
 * This file demonstrates how to use the LLM adapter in your application.
 * Run this with: npx ts-node src/lib/llm/usage-example.ts
 */

import { createLLMAdapter } from './adapter';
import { LLMTelemetry } from './types';

async function demonstrateLLMAdapter() {
    console.log('🚀 LLM Adapter Usage Example\n');

    // Create adapter with mock provider for demonstration
    const adapter = createLLMAdapter({
        provider: 'mock',
        timeout: 5000,
        maxRetries: 2,
        retryDelay: 1000,
        maxTokens: 2000,
    });

    // Add telemetry hook to track usage
    adapter.addTelemetryHook((telemetry: LLMTelemetry) => {
        console.log('📊 Telemetry:', {
            provider: telemetry.provider,
            status: telemetry.status,
            duration: `${telemetry.duration}ms`,
            tokens: telemetry.tokens,
            retryCount: telemetry.retryCount,
        });
    });

    try {
        // Example 1: Basic text generation
        console.log('📝 Example 1: Basic text generation');
        const response1 = await adapter.generate('Write a professional summary for a software engineer');
        console.log('Response:', response1.text.substring(0, 100) + '...\n');

        // Example 2: Custom parameters
        console.log('⚙️  Example 2: Custom parameters');
        const response2 = await adapter.generate(
            'Help me improve this resume section',
            {
                temperature: 0.3,
                maxTokens: 500,
                model: 'gpt-4',
            }
        );
        console.log('Response:', response2.text.substring(0, 100) + '...\n');

        // Example 3: Batch processing
        console.log('🔄 Example 3: Batch processing');
        const prompts = [
            'Write a cover letter for a software engineer position',
            'Suggest improvements for this job description',
            'Help me format this resume section',
        ];

        const responses = await Promise.all(
            prompts.map(async (prompt, index) => {
                const response = await adapter.generate(prompt);
                return { index: index + 1, text: response.text.substring(0, 50) + '...' };
            })
        );

        responses.forEach(({ index, text }) => {
            console.log(`Response ${index}: ${text}`);
        });

        console.log('\n✅ All examples completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run the example if this file is executed directly
if (require.main === module) {
    demonstrateLLMAdapter().catch(console.error);
}

export { demonstrateLLMAdapter };
