import OpenAI from 'openai';
import { ENV } from './env.js';

/**
 * Get OpenAI instance if API key is properly configured
 * Returns null if OpenAI is not available or properly configured
 */
export function getOpenAIInstance() {
  try {
    // Debug: Log the API key details
    console.log('OpenAI API Key check:', {
      exists: !!ENV.OPENAI_API_KEY,
      length: ENV.OPENAI_API_KEY?.length,
      startsWithSk: ENV.OPENAI_API_KEY?.startsWith('sk-'),
      prefix: ENV.OPENAI_API_KEY?.substring(0, 10) + '...'
    });

    // Check if OpenAI API key is available and properly configured
    if (!ENV.OPENAI_API_KEY || 
        ENV.OPENAI_API_KEY.startsWith('sk-temp-') || 
        ENV.OPENAI_API_KEY === 'your_openai_api_key' ||
        ENV.OPENAI_API_KEY.length < 40) { // Fixed: OpenAI keys are much longer than 20 chars
      console.log('OpenAI API key not properly configured - OpenAI features disabled');
      return null;
    }

    // Create OpenAI instance
    const openai = new OpenAI({
      apiKey: ENV.OPENAI_API_KEY,
    });

    console.log('OpenAI instance created successfully');
    return openai;
  } catch (error) {
    console.error('Failed to create OpenAI instance:', error);
    return null;
  }
}

/**
 * Check if OpenAI is available and properly configured
 */
export function isOpenAIAvailable() {
  return false; // Always return false to disable OpenAI
}

/**
 * Test OpenAI connection (optional - for health checks)
 */
export async function testOpenAIConnection() {
  return { success: false, message: 'OpenAI disabled by configuration' };
}

// Export singleton instance for backwards compatibility
export const openai = null; // Always null to disable OpenAI