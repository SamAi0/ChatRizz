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
    this.cache = new Map(); // Simple in-memory cache
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
    this.primaryProvider = isRapidAPIAvailable() ? 'rapidapi' : null;
    
    console.log('Translation Service initialized:', {
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
   * Detect the language of the given text with RapidAPI as primary provider
   */
  async detectLanguage(text) {
    if (!text || text.trim().length === 0) {
      return 'en'; // Default to English for empty text
    }

    // Use RapidAPI for language detection
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
   * Fallback translation when providers are unavailable
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
   * Translate text from one language to another using RapidAPI as primary provider
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

    // Use RapidAPI for translation
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