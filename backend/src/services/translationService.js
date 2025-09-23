import { getOpenAIInstance } from '../lib/openai.js';

// Supported languages with their codes and display names
export const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese (Simplified)',
  'zh-tw': 'Chinese (Traditional)',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'th': 'Thai',
  'vi': 'Vietnamese',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'da': 'Danish',
  'no': 'Norwegian',
  'fi': 'Finnish',
  'pl': 'Polish',
  'tr': 'Turkish',
  'he': 'Hebrew',
  'uk': 'Ukrainian',
  'cs': 'Czech',
  'hu': 'Hungarian',
  'ro': 'Romanian',
  'bg': 'Bulgarian',
  'hr': 'Croatian',
  'sk': 'Slovak',
  'sl': 'Slovenian'
};

class TranslationService {
  constructor() {
    this.openai = getOpenAIInstance();
    this.cache = new Map(); // Simple in-memory cache
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Generate cache key for translation
   */
  generateCacheKey(text, fromLang, toLang) {
    return `${fromLang}-${toLang}-${text}`;
  }

  /**
   * Check if cached translation is still valid
   */
  isCacheValid(cacheEntry) {
    return Date.now() - cacheEntry.timestamp < this.cacheExpiry;
  }

  /**
   * Detect the language of the given text
   */
  async detectLanguage(text) {
    if (!this.openai) {
      throw new Error('OpenAI API not available. Please configure your API key.');
    }

    if (!text || text.trim().length === 0) {
      return 'en'; // Default to English for empty text
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a language detection system. Respond with only the ISO 639-1 language code (e.g., 'en', 'es', 'fr') for the detected language. If uncertain, respond with 'en'."
          },
          {
            role: "user",
            content: `Detect the language of this text: "${text}"`
          }
        ],
        max_tokens: 10,
        temperature: 0
      });

      const detectedLang = response.choices[0]?.message?.content?.trim().toLowerCase();
      
      // Validate the detected language is in our supported list
      if (SUPPORTED_LANGUAGES[detectedLang]) {
        return detectedLang;
      }
      
      return 'en'; // Fallback to English
    } catch (error) {
      console.error('Language detection error:', error);
      
      // Handle specific OpenAI errors gracefully
      if (error.status === 429) {
        console.warn('OpenAI quota exceeded, falling back to English detection');
        return 'en'; // Fallback to English when quota exceeded
      }
      
      return 'en'; // Fallback to English on any error
    }
  }

  /**
   * Fallback translation when OpenAI is unavailable
   */
  getMockTranslation(text, fromLang, toLang) {
    const languages = SUPPORTED_LANGUAGES;
    return {
      translatedText: `[MOCK TRANSLATION] ${text} (${languages[fromLang] || fromLang} → ${languages[toLang] || toLang})`,
      detectedLanguage: fromLang === 'auto' ? 'en' : fromLang,
      cached: false,
      mock: true
    };
  }

  /**
   * Translate text from one language to another
   */
  async translateText(text, fromLang = 'auto', toLang = 'en') {
    if (!this.openai) {
      throw new Error('OpenAI API not available. Please configure your API key.');
    }

    if (!text || text.trim().length === 0) {
      return { translatedText: text, detectedLanguage: 'en' };
    }

    // Auto-detect language if needed
    let sourceLanguage = fromLang;
    if (fromLang === 'auto') {
      sourceLanguage = await this.detectLanguage(text);
    }

    // If source and target languages are the same, return original text
    if (sourceLanguage === toLang) {
      return { 
        translatedText: text, 
        detectedLanguage: sourceLanguage,
        cached: false 
      };
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(text, sourceLanguage, toLang);
    const cachedResult = this.cache.get(cacheKey);
    
    if (cachedResult && this.isCacheValid(cachedResult)) {
      return {
        translatedText: cachedResult.translation,
        detectedLanguage: sourceLanguage,
        cached: true
      };
    }

    try {
      const sourceLangName = SUPPORTED_LANGUAGES[sourceLanguage] || sourceLanguage;
      const targetLangName = SUPPORTED_LANGUAGES[toLang] || toLang;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the given text from ${sourceLangName} to ${targetLangName}. 
            
            Rules:
            - Maintain the original tone and context
            - Preserve formatting and special characters
            - If the text contains names, places, or technical terms, keep them appropriate for the target language
            - Respond with only the translated text, no explanations
            - If the text is already in the target language, return it as is`
          },
          {
            role: "user",
            content: text
          }
        ],
        max_tokens: Math.max(100, text.length * 2), // Dynamic token limit based on input length
        temperature: 0.3 // Low temperature for consistent translations
      });

      const translatedText = response.choices[0]?.message?.content?.trim();

      if (!translatedText) {
        throw new Error('No translation received from OpenAI');
      }

      // Cache the result
      this.cache.set(cacheKey, {
        translation: translatedText,
        timestamp: Date.now()
      });

      return {
        translatedText,
        detectedLanguage: sourceLanguage,
        cached: false
      };

    } catch (error) {
      console.error('Translation error:', error);
      
      // Handle specific OpenAI errors with user-friendly messages
      if (error.status === 429) {
        if (error.code === 'insufficient_quota') {
          console.warn('OpenAI quota exceeded, providing mock translation');
          // Return mock translation instead of throwing error
          return this.getMockTranslation(text, sourceLanguage, toLang);
        } else {
          throw new Error('Translation service is currently busy. Please try again in a moment.');
        }
      } else if (error.status === 401) {
        throw new Error('Translation service authentication error. Please contact support.');
      } else if (error.status === 503) {
        throw new Error('Translation service is temporarily down for maintenance.');
      }
      
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  /**
   * Translate multiple texts in batch
   */
  async translateBatch(texts, fromLang = 'auto', toLang = 'en') {
    if (!this.openai) {
      throw new Error('OpenAI API not available. Please configure your API key.');
    }

    if (!Array.isArray(texts) || texts.length === 0) {
      return [];
    }

    const results = [];
    
    // Process in chunks to avoid rate limits
    const chunkSize = 5;
    for (let i = 0; i < texts.length; i += chunkSize) {
      const chunk = texts.slice(i, i + chunkSize);
      const chunkPromises = chunk.map(text => this.translateText(text, fromLang, toLang));
      
      try {
        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);
      } catch (error) {
        console.error('Batch translation error:', error);
        // Add error placeholders for failed translations
        results.push(...chunk.map(text => ({
          translatedText: text,
          detectedLanguage: 'en',
          error: true
        })));
      }
      
      // Small delay between chunks to respect rate limits
      if (i + chunkSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Get available languages
   */
  getAvailableLanguages() {
    return SUPPORTED_LANGUAGES;
  }

  /**
   * Clear translation cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const translationService = new TranslationService();
export default translationService;