// Translation utilities for ChatRizz

// Language codes and names
const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'es': 'Spanish', 
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese',
  'ar': 'Arabic',
  'hi': 'Hindi'
};

// AI Agent function for language detection and translation
async function invokeAIAgent(systemPrompt, userPrompt) {
  try {
    // For now, return a simple mock response
    // In a real implementation, this would call an AI service like OpenAI, Claude, etc.
    console.log('AI Agent called:', { systemPrompt, userPrompt });
    
    // Mock language detection - in real app, replace with actual AI call
    if (systemPrompt.includes('language detection')) {
      // Simple heuristic-based language detection
      const text = userPrompt.match(/"([^"]+)"/)?.[1] || '';
      if (/[а-яё]/i.test(text)) return 'ru';
      if (/[一-龯]/i.test(text)) return 'zh';
      if (/[あ-ん]/i.test(text)) return 'ja';
      if (/[가-힣]/i.test(text)) return 'ko';
      if (/[ا-ي]/i.test(text)) return 'ar';
      if (/[ह-ॿ]/i.test(text)) return 'hi';
      if (/[ñáéíóúü]/i.test(text)) return 'es';
      if (/[àâäéèêëïîôöùûüÿç]/i.test(text)) return 'fr';
      if (/[äöüß]/i.test(text)) return 'de';
      if (/[àèéìíîòóùú]/i.test(text)) return 'it';
      if (/[ãáàâçéêíóôõú]/i.test(text)) return 'pt';
      return 'en';
    }
    
    // Mock translation - in real app, replace with actual AI call
    if (systemPrompt.includes('translator')) {
      return userPrompt.match(/"([^"]+)"/)?.[1] || text;
    }
    
    return 'en';
  } catch (error) {
    console.error('AI Agent error:', error);
    return 'en';
  }
}

// Detect language of text
async function detectLanguage(text) {
  try {
    if (!text || text.trim().length === 0) return 'en';
    
    // Use AI agent for language detection
    const systemPrompt = `You are a language detection expert. Your task is to detect the language of the given text and return only the language code (like 'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi'). Return only the two-letter language code, nothing else.`;
    const userPrompt = `Detect the language of this text: "${text}"`;
    
    const languageCode = await invokeAIAgent(systemPrompt, userPrompt);
    const detectedLang = languageCode.trim().toLowerCase();
    
    // Validate detected language
    return SUPPORTED_LANGUAGES[detectedLang] ? detectedLang : 'en';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en'; // Default to English
  }
}

// Translate text to target language
async function translateText(text, targetLanguage, sourceLanguage = null) {
  try {
    if (!text || text.trim().length === 0) return text;
    
    // Detect source language if not provided
    if (!sourceLanguage) {
      sourceLanguage = await detectLanguage(text);
    }
    
    // No translation needed if source and target are the same
    if (sourceLanguage === targetLanguage) return text;
    
    const targetLangName = SUPPORTED_LANGUAGES[targetLanguage] || 'English';
    const sourceLangName = SUPPORTED_LANGUAGES[sourceLanguage] || 'English';
    
    // Use AI agent for translation
    const systemPrompt = `You are an experienced language translator. Your task is to translate text from ${sourceLangName} to ${targetLangName}. Provide only the translation, no additional text or explanations.`;
    const userPrompt = `Translate this text to ${targetLangName}: "${text}"`;
    
    const translatedText = await invokeAIAgent(systemPrompt, userPrompt);
    return translatedText.trim();
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
}

// Auto-translate message based on user preference
async function autoTranslateMessage(message, userPreferredLanguage) {
  try {
    if (!message.text || !userPreferredLanguage) return message;
    
    const detectedLang = await detectLanguage(message.text);
    
    // Only translate if the message language differs from user preference
    if (detectedLang !== userPreferredLanguage) {
      const translatedText = await translateText(message.text, userPreferredLanguage, detectedLang);
      
      return {
        ...message,
        text: translatedText,
        originalText: message.text,
        originalLanguage: detectedLang,
        translatedLanguage: userPreferredLanguage,
        isTranslated: true
      };
    }
    
    return message;
  } catch (error) {
    console.error('Auto-translation error:', error);
    return message;
  }
}

// Get language name from code
function getLanguageName(languageCode) {
  return SUPPORTED_LANGUAGES[languageCode] || 'Unknown';
}