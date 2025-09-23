import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translationService } from '../lib/translationService';

export const useTranslationStore = create(
  persist(
    (set, get) => ({
      // User preferences
      preferredLanguage: 'en',
      autoTranslate: false,
      showOriginal: true,
      
      // Supported languages
      supportedLanguages: {},
      languagesLoaded: false,
      
      // Translation states
      isTranslating: false,
      translationError: null,
      
      // Message translations cache
      messageTranslations: new Map(),
      
      // Loading states for individual messages
      translatingMessages: new Set(),

      // Actions
      setPreferredLanguage: (language) => {
        set({ preferredLanguage: language });
      },

      setAutoTranslate: (enabled) => {
        set({ autoTranslate: enabled });
      },

      setShowOriginal: (show) => {
        set({ showOriginal: show });
      },

      // Load supported languages
      loadSupportedLanguages: async () => {
        try {
          const response = await translationService.getSupportedLanguages();
          set({
            supportedLanguages: response.languages,
            languagesLoaded: true,
            translationError: null
          });
        } catch (error) {
          console.error('Failed to load supported languages:', error);
          set({
            translationError: error.message,
            languagesLoaded: false
          });
        }
      },

      // Translate a single message
      translateMessage: async (messageId, content, fromLang = 'auto', toLang = null) => {
        const targetLang = toLang || get().preferredLanguage;
        
        // Don't translate if target language is the same as detected/source language
        if (fromLang === targetLang) {
          return { translatedText: content, cached: true };
        }

        const { translatingMessages, messageTranslations } = get();
        
        // Check if already translating this message
        if (translatingMessages.has(messageId)) {
          return null;
        }

        // Check cache first
        const cacheKey = `${messageId}-${fromLang}-${targetLang}`;
        if (messageTranslations.has(cacheKey)) {
          return messageTranslations.get(cacheKey);
        }

        try {
          // Mark as translating
          set({
            translatingMessages: new Set([...translatingMessages, messageId]),
            translationError: null
          });

          const result = await translationService.translateMessage(
            messageId,
            content,
            fromLang,
            targetLang
          );

          // Cache the translation
          const newTranslations = new Map(messageTranslations);
          newTranslations.set(cacheKey, result.translation);

          // Remove from translating set
          const newTranslatingMessages = new Set(translatingMessages);
          newTranslatingMessages.delete(messageId);

          set({
            messageTranslations: newTranslations,
            translatingMessages: newTranslatingMessages,
            translationError: null
          });

          return result.translation;
        } catch (error) {
          console.error('Translation failed:', error);
          
          // Remove from translating set
          const newTranslatingMessages = new Set(translatingMessages);
          newTranslatingMessages.delete(messageId);
          
          set({
            translatingMessages: newTranslatingMessages,
            translationError: error.message
          });
          
          throw error;
        }
      },

      // Translate text (not message-specific)
      translateText: async (text, fromLang = 'auto', toLang = null) => {
        const targetLang = toLang || get().preferredLanguage;
        
        set({ isTranslating: true, translationError: null });
        
        try {
          const result = await translationService.translateText(text, fromLang, targetLang);
          set({ isTranslating: false, translationError: null });
          return result;
        } catch (error) {
          console.error('Translation failed:', error);
          set({ 
            isTranslating: false, 
            translationError: error.message 
          });
          throw error;
        }
      },

      // Detect language
      detectLanguage: async (text) => {
        try {
          const result = await translationService.detectLanguage(text);
          return result;
        } catch (error) {
          console.error('Language detection failed:', error);
          set({ translationError: error.message });
          throw error;
        }
      },

      // Get cached translation for a message
      getMessageTranslation: (messageId, fromLang, toLang) => {
        const cacheKey = `${messageId}-${fromLang}-${toLang}`;
        return get().messageTranslations.get(cacheKey);
      },

      // Check if message is being translated
      isMessageTranslating: (messageId) => {
        return get().translatingMessages.has(messageId);
      },

      // Clear translation cache
      clearTranslationCache: async () => {
        try {
          await translationService.clearCache();
          set({ 
            messageTranslations: new Map(),
            translationError: null 
          });
        } catch (error) {
          console.error('Failed to clear translation cache:', error);
          set({ translationError: error.message });
          throw error;
        }
      },

      // Clear local cache only
      clearLocalCache: () => {
        translationService.clearLocalCache();
        set({ 
          messageTranslations: new Map(),
          translatingMessages: new Set()
        });
      },

      // Get cache statistics
      getCacheStats: async () => {
        try {
          const serverStats = await translationService.getCacheStats();
          const localStats = translationService.getLocalCacheStats();
          return {
            server: serverStats.cacheStats,
            local: localStats,
            messageCache: {
              size: get().messageTranslations.size,
              translating: get().translatingMessages.size
            }
          };
        } catch (error) {
          console.error('Failed to get cache stats:', error);
          throw error;
        }
      },

      // Reset translation error
      clearError: () => {
        set({ translationError: null });
      }
    }),
    {
      name: 'translation-store',
      partialize: (state) => ({
        preferredLanguage: state.preferredLanguage,
        autoTranslate: state.autoTranslate,
        showOriginal: state.showOriginal
      })
    }
  )
);