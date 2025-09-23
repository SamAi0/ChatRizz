import { axiosInstance } from './axios';

class TranslationService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Get cache key for translation
   */
  getCacheKey(text, fromLang, toLang) {
    return `${fromLang}-${toLang}-${text}`;
  }

  /**
   * Check if cached translation is still valid
   */
  isCacheValid(cacheEntry) {
    return Date.now() - cacheEntry.timestamp < this.cacheExpiry;
  }

  /**
   * Get all supported languages
   */
  async getSupportedLanguages() {
    try {
      const response = await axiosInstance.get('/translation/languages');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch supported languages:', error);
      throw new Error('Failed to fetch supported languages');
    }
  }

  /**
   * Detect language of given text
   */
  async detectLanguage(text) {
    try {
      if (!text || text.trim().length === 0) {
        return { detectedLanguage: 'en', languageName: 'English' };
      }

      const response = await axiosInstance.post('/translation/detect', { text });
      return response.data;
    } catch (error) {
      console.error('Language detection failed:', error);
      throw new Error('Language detection failed');
    }
  }

  /**
   * Translate text from one language to another
   */
  async translateText(text, fromLang = 'auto', toLang = 'en') {
    try {
      if (!text || text.trim().length === 0) {
        return {
          originalText: text,
          translatedText: text,
          detectedLanguage: 'en',
          fromLanguage: 'English',
          toLanguage: 'English',
          cached: false
        };
      }

      // Check local cache first
      const cacheKey = this.getCacheKey(text, fromLang, toLang);
      const cachedResult = this.cache.get(cacheKey);
      
      if (cachedResult && this.isCacheValid(cachedResult)) {
        return {
          ...cachedResult.data,
          cached: true
        };
      }

      const response = await axiosInstance.post('/translation/translate', {
        text,
        fromLang,
        toLang
      });

      const result = response.data;

      // Cache the result locally
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Translation failed:', error);
      throw new Error(error.response?.data?.message || 'Translation failed');
    }
  }

  /**
   * Translate multiple texts at once
   */
  async translateBatch(texts, fromLang = 'auto', toLang = 'en') {
    try {
      if (!Array.isArray(texts) || texts.length === 0) {
        return { results: [] };
      }

      const response = await axiosInstance.post('/translation/batch', {
        texts,
        fromLang,
        toLang
      });

      return response.data;
    } catch (error) {
      console.error('Batch translation failed:', error);
      throw new Error(error.response?.data?.message || 'Batch translation failed');
    }
  }

  /**
   * Translate a chat message
   */
  async translateMessage(messageId, content, fromLang = 'auto', toLang) {
    try {
      const response = await axiosInstance.post('/translation/message', {
        messageId,
        content,
        fromLang,
        toLang
      });

      return response.data;
    } catch (error) {
      console.error('Message translation failed:', error);
      throw new Error(error.response?.data?.message || 'Message translation failed');
    }
  }

  /**
   * Get translation cache statistics
   */
  async getCacheStats() {
    try {
      const response = await axiosInstance.get('/translation/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch cache stats:', error);
      throw new Error('Failed to fetch cache stats');
    }
  }

  /**
   * Clear translation cache
   */
  async clearCache() {
    try {
      const response = await axiosInstance.delete('/translation/cache');
      this.cache.clear(); // Also clear local cache
      return response.data;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw new Error('Failed to clear cache');
    }
  }

  /**
   * Clear local cache only
   */
  clearLocalCache() {
    this.cache.clear();
  }

  /**
   * Get local cache statistics
   */
  getLocalCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const translationService = new TranslationService();
export default translationService;