const OpenAI = require('openai');
const { Translate } = require('@google-cloud/translate').v2;

class TranslationService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.googleTranslate = new Translate({
      projectId: process.env.GOOGLE_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  }

  async detectLanguage(text) {
    try {
      if (process.env.GOOGLE_PROJECT_ID) {
        const [detection] = await this.googleTranslate.detect(text);
        return detection.language;
      }
      
      // Fallback to AI detection
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'system',
          content: 'Detect the language of the given text. Return only the two-letter language code.'
        }, {
          role: 'user',
          content: text
        }],
        max_tokens: 10
      });
      
      return response.choices[0].message.content.trim().toLowerCase();
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en';
    }
  }

  async translateText(text, targetLanguage, sourceLanguage = null) {
    try {
      if (!sourceLanguage) {
        sourceLanguage = await this.detectLanguage(text);
      }
      
      if (sourceLanguage === targetLanguage) {
        return text;
      }

      if (process.env.GOOGLE_PROJECT_ID) {
        const [translation] = await this.googleTranslate.translate(text, targetLanguage);
        return translation;
      }
      
      // Fallback to OpenAI
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'system',
          content: `Translate the following text to ${targetLanguage}. Return only the translation.`
        }, {
          role: 'user',
          content: text
        }],
        max_tokens: 500
      });
      
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }
}

module.exports = new TranslationService();
