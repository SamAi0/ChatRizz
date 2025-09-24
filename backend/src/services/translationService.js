import { getOpenAIInstance } from '../lib/openai.js';
import { 
  translateWithRapidAPI, 
  detectLanguageWithRapidAPI, 
  isRapidAPIAvailable,
  RAPIDAPI_LANGUAGE_MAP 
} from '../lib/rapidapi.js';

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
    this.primaryProvider = this.openai ? 'openai' : (isRapidAPIAvailable() ? 'rapidapi' : null);
    
    console.log('Translation Service initialized:', {
      openai: !!this.openai,
      rapidapi: isRapidAPIAvailable(),
      primaryProvider: this.primaryProvider
    });
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
   * Detect the language of the given text with automatic fallback
   */
  async detectLanguage(text) {
    if (!text || text.trim().length === 0) {
      return 'en'; // Default to English for empty text
    }

    // Try OpenAI first
    if (this.openai) {
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
        console.warn('OpenAI language detection failed, trying RapidAPI fallback:', error.message);
      }
    }

    // Fallback to RapidAPI
    if (isRapidAPIAvailable()) {
      try {
        const detectedLang = await detectLanguageWithRapidAPI(text);
        return detectedLang || 'en';
      } catch (error) {
        console.warn('RapidAPI language detection failed:', error.message);
      }
    }

    // Final fallback
    return 'en';
  }

  /**
   * Translate using OpenAI
   */
  async translateWithOpenAI(text, sourceLanguage, toLang) {
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
      max_tokens: Math.max(100, text.length * 2),
      temperature: 0.3
    });

    const translatedText = response.choices[0]?.message?.content?.trim();
    
    if (!translatedText) {
      throw new Error('No translation received from OpenAI');
    }

    return { translatedText };
  }

  /**
   * Fallback translation when OpenAI is unavailable
   */
  getMockTranslation(text, fromLang, toLang) {
    const languages = SUPPORTED_LANGUAGES;
    return {
      translatedText: `[FALLBACK] ${text}`,
      detectedLanguage: fromLang === 'auto' ? 'en' : fromLang,
      cached: false,
      provider: 'fallback'
    };
  }

  /**
   * Translate text from one language to another with automatic fallback
   */
  async translateText(text, fromLang = 'auto', toLang = 'en') {
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
        cached: false,
        provider: 'none'
      };
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(text, sourceLanguage, toLang);
    const cachedResult = this.cache.get(cacheKey);
    
    if (cachedResult && this.isCacheValid(cachedResult)) {
      return {
        translatedText: cachedResult.translation,
        detectedLanguage: sourceLanguage,
        cached: true,
        provider: cachedResult.provider || 'cached'
      };
    }

    // Try OpenAI first
    if (this.openai) {
      try {
        const result = await this.translateWithOpenAI(text, sourceLanguage, toLang);
        
        // Cache the result
        this.cache.set(cacheKey, {
          translation: result.translatedText,
          timestamp: Date.now(),
          provider: 'openai'
        });

        return {
          ...result,
          detectedLanguage: sourceLanguage,
          cached: false,
          provider: 'openai'
        };
      } catch (error) {
        console.warn('OpenAI translation failed, trying RapidAPI fallback:', error.message);
      }
    }

    // Fallback to RapidAPI
    if (isRapidAPIAvailable()) {
      try {
        const result = await translateWithRapidAPI(text, sourceLanguage, toLang);
        
        // Cache the result
        this.cache.set(cacheKey, {
          translation: result.translatedText,
          timestamp: Date.now(),
          provider: 'rapidapi'
        });

        return {
          ...result,
          detectedLanguage: sourceLanguage,
          cached: false,
          provider: 'rapidapi'
        };
      } catch (error) {
        console.warn('RapidAPI translation failed:', error.message);
      }
    }

    // Final fallback - return mock translation
    console.warn('All translation providers failed, returning mock translation');
    return this.getMockTranslation(text, sourceLanguage, toLang);
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