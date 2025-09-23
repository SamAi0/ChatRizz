import express from 'express';
import { translationService } from '../services/translationService.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/translation/languages
 * @desc    Get all supported languages
 * @access  Public
 */
router.get('/languages', (req, res) => {
  try {
    const languages = translationService.getAvailableLanguages();
    res.json({
      success: true,
      languages
    });
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supported languages'
    });
  }
});

/**
 * @route   POST /api/translation/detect
 * @desc    Detect language of given text
 * @access  Private
 */
router.post('/detect', protectRoute, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Text is required'
      });
    }

    if (text.trim().length === 0) {
      return res.json({
        success: true,
        detectedLanguage: 'en',
        languageName: 'English'
      });
    }

    const detectedLanguage = await translationService.detectLanguage(text);
    const languages = translationService.getAvailableLanguages();
    
    res.json({
      success: true,
      detectedLanguage,
      languageName: languages[detectedLanguage] || 'Unknown',
      text
    });

  } catch (error) {
    console.error('Language detection error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Language detection failed'
    });
  }
});

/**
 * @route   POST /api/translation/translate
 * @desc    Translate text from one language to another
 * @access  Private
 */
router.post('/translate', protectRoute, async (req, res) => {
  try {
    const { text, fromLang = 'auto', toLang = 'en' } = req.body;

    // Validation
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Text is required'
      });
    }

    if (!toLang || typeof toLang !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Target language is required'
      });
    }

    const languages = translationService.getAvailableLanguages();
    if (toLang !== 'auto' && !languages[toLang]) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported target language'
      });
    }

    if (fromLang !== 'auto' && !languages[fromLang]) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported source language'
      });
    }

    // Perform translation
    const result = await translationService.translateText(text, fromLang, toLang);

    res.json({
      success: true,
      originalText: text,
      translatedText: result.translatedText,
      detectedLanguage: result.detectedLanguage,
      fromLanguage: languages[result.detectedLanguage] || 'Unknown',
      toLanguage: languages[toLang] || 'Unknown',
      cached: result.cached || false
    });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Translation failed'
    });
  }
});

/**
 * @route   POST /api/translation/batch
 * @desc    Translate multiple texts at once
 * @access  Private
 */
router.post('/batch', protectRoute, async (req, res) => {
  try {
    const { texts, fromLang = 'auto', toLang = 'en' } = req.body;

    // Validation
    if (!Array.isArray(texts)) {
      return res.status(400).json({
        success: false,
        message: 'Texts must be an array'
      });
    }

    if (texts.length === 0) {
      return res.json({
        success: true,
        results: []
      });
    }

    if (texts.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 50 texts allowed per batch'
      });
    }

    const languages = translationService.getAvailableLanguages();
    if (toLang !== 'auto' && !languages[toLang]) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported target language'
      });
    }

    // Perform batch translation
    const results = await translationService.translateBatch(texts, fromLang, toLang);

    res.json({
      success: true,
      results: results.map((result, index) => ({
        originalText: texts[index],
        translatedText: result.translatedText,
        detectedLanguage: result.detectedLanguage,
        fromLanguage: languages[result.detectedLanguage] || 'Unknown',
        toLanguage: languages[toLang] || 'Unknown',
        cached: result.cached || false,
        error: result.error || false
      }))
    });

  } catch (error) {
    console.error('Batch translation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Batch translation failed'
    });
  }
});

/**
 * @route   POST /api/translation/message
 * @desc    Translate a chat message (specialized endpoint)
 * @access  Private
 */
router.post('/message', protectRoute, async (req, res) => {
  try {
    const { messageId, content, fromLang = 'auto', toLang } = req.body;

    if (!content || !toLang) {
      return res.status(400).json({
        success: false,
        message: 'Content and target language are required'
      });
    }

    const result = await translationService.translateText(content, fromLang, toLang);
    const languages = translationService.getAvailableLanguages();

    res.json({
      success: true,
      messageId,
      translation: {
        originalText: content,
        translatedText: result.translatedText,
        detectedLanguage: result.detectedLanguage,
        fromLanguage: languages[result.detectedLanguage] || 'Unknown',
        toLanguage: languages[toLang] || 'Unknown',
        cached: result.cached || false
      }
    });

  } catch (error) {
    console.error('Message translation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Message translation failed'
    });
  }
});

/**
 * @route   GET /api/translation/stats
 * @desc    Get translation cache statistics (admin)
 * @access  Private
 */
router.get('/stats', protectRoute, (req, res) => {
  try {
    const stats = translationService.getCacheStats();
    res.json({
      success: true,
      cacheStats: stats
    });
  } catch (error) {
    console.error('Translation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch translation statistics'
    });
  }
});

/**
 * @route   DELETE /api/translation/cache
 * @desc    Clear translation cache
 * @access  Private
 */
router.delete('/cache', protectRoute, (req, res) => {
  try {
    translationService.clearCache();
    res.json({
      success: true,
      message: 'Translation cache cleared successfully'
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear translation cache'
    });
  }
});

export default router;