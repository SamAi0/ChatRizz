import https from 'https';
import { ENV } from './env.js';

// Language mappings for RapidAPI Deep Translate
export const RAPIDAPI_LANGUAGE_MAP = {
  'en': 'en',
  'es': 'es', 
  'fr': 'fr',
  'de': 'de',
  'it': 'it',
  'pt': 'pt',
  'ru': 'ru',
  'ja': 'ja',
  'ko': 'ko',
  'zh': 'zh',
  'zh-tw': 'zh-TW',
  'ar': 'ar',
  'hi': 'hi',
  'th': 'th',
  'vi': 'vi',
  'nl': 'nl',
  'sv': 'sv',
  'da': 'da',
  'no': 'no',
  'fi': 'fi',
  'pl': 'pl',
  'tr': 'tr',
  'he': 'he',
  'uk': 'uk',
  'cs': 'cs',
  'hu': 'hu',
  'ro': 'ro',
  'bg': 'bg',
  'hr': 'hr',
  'sk': 'sk',
  'sl': 'sl'
};

/**
 * Check if RapidAPI is available and properly configured
 */
export function isRapidAPIAvailable() {
  return !!(ENV.RAPIDAPI_KEY && ENV.RAPIDAPI_KEY.length > 10);
}

/**
 * Translate text using RapidAPI Deep Translate
 */
export function translateWithRapidAPI(text, fromLang = 'auto', toLang = 'en') {
  return new Promise((resolve, reject) => {
    if (!isRapidAPIAvailable()) {
      reject(new Error('RapidAPI key not configured'));
      return;
    }

    // Map language codes to RapidAPI format
    const sourceCode = fromLang === 'auto' ? 'auto' : (RAPIDAPI_LANGUAGE_MAP[fromLang] || fromLang);
    const targetCode = RAPIDAPI_LANGUAGE_MAP[toLang] || toLang;

    const options = {
      method: 'POST',
      hostname: 'deep-translate1.p.rapidapi.com',
      port: null,
      path: '/language/translate/v2',
      headers: {
        'x-rapidapi-key': ENV.RAPIDAPI_KEY,
        'x-rapidapi-host': 'deep-translate1.p.rapidapi.com',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, function (res) {
      const chunks = [];

      res.on('data', function (chunk) {
        chunks.push(chunk);
      });

      res.on('end', function () {
        try {
          const body = Buffer.concat(chunks);
          const response = JSON.parse(body.toString());
          
          if (response.data && response.data.translations) {
            const translation = response.data.translations.translatedText;
            const detectedLang = response.data.translations.detectedSourceLanguage || fromLang;
            
            resolve({
              translatedText: translation,
              detectedLanguage: detectedLang,
              cached: false,
              provider: 'rapidapi'
            });
          } else {
            reject(new Error('Invalid response from RapidAPI'));
          }
        } catch (error) {
          reject(new Error(`Failed to parse RapidAPI response: ${error.message}`));
        }
      });
    });

    req.on('error', function (error) {
      reject(new Error(`RapidAPI request failed: ${error.message}`));
    });

    // Set timeout
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('RapidAPI request timeout'));
    });

    try {
      req.write(JSON.stringify({
        q: text,
        source: sourceCode,
        target: targetCode
      }));
      req.end();
    } catch (error) {
      reject(new Error(`Failed to send RapidAPI request: ${error.message}`));
    }
  });
}

/**
 * Detect language using RapidAPI (fallback detection)
 */
export function detectLanguageWithRapidAPI(text) {
  return new Promise((resolve, reject) => {
    if (!isRapidAPIAvailable()) {
      reject(new Error('RapidAPI key not configured'));
      return;
    }

    const options = {
      method: 'POST',
      hostname: 'deep-translate1.p.rapidapi.com',
      port: null,
      path: '/language/translate/v2',
      headers: {
        'x-rapidapi-key': ENV.RAPIDAPI_KEY,
        'x-rapidapi-host': 'deep-translate1.p.rapidapi.com',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, function (res) {
      const chunks = [];

      res.on('data', function (chunk) {
        chunks.push(chunk);
      });

      res.on('end', function () {
        try {
          const body = Buffer.concat(chunks);
          const response = JSON.parse(body.toString());
          
          if (response.data && response.data.translations) {
            const detectedLang = response.data.translations.detectedSourceLanguage || 'en';
            resolve(detectedLang);
          } else {
            resolve('en'); // Fallback to English
          }
        } catch (error) {
          resolve('en'); // Fallback to English on error
        }
      });
    });

    req.on('error', function (error) {
      resolve('en'); // Fallback to English on error
    });

    // Set timeout
    req.setTimeout(5000, () => {
      req.destroy();
      resolve('en'); // Fallback to English on timeout
    });

    try {
      // Use auto-detect by translating to same language
      req.write(JSON.stringify({
        q: text.substring(0, 100), // Limit text for detection
        source: 'auto',
        target: 'en'
      }));
      req.end();
    } catch (error) {
      resolve('en'); // Fallback to English
    }
  });
}

/**
 * Test RapidAPI connection
 */
export async function testRapidAPIConnection() {
  if (!isRapidAPIAvailable()) {
    return { success: false, message: 'RapidAPI not configured' };
  }

  try {
    const result = await translateWithRapidAPI('Hello', 'en', 'es');
    if (result.translatedText) {
      return { success: true, message: 'RapidAPI connection successful' };
    } else {
      return { success: false, message: 'Invalid response from RapidAPI' };
    }
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'RapidAPI connection test failed' 
    };
  }
}