import OpenAI from "openai";
import { ENV } from "./env.js";

// Only create OpenAI instance if API key is available and valid
function getOpenAIInstance() {
  if (!ENV.OPENAI_API_KEY || ENV.OPENAI_API_KEY.startsWith('sk-temp-') || ENV.OPENAI_API_KEY === 'your_openai_api_key') {
    return null;
  }
  return new OpenAI({ apiKey: ENV.OPENAI_API_KEY });
}

export const openai = getOpenAIInstance();

export async function translateText({ text, targetLanguage }) {
  if (!openai || !ENV.OPENAI_API_KEY || ENV.OPENAI_API_KEY.startsWith('sk-temp-') || ENV.OPENAI_API_KEY === 'your_openai_api_key') {
    console.warn("OPENAI_API_KEY not set or invalid, skipping translation");
    return { translatedText: text, detectedLanguage: null, note: "OPENAI_API_KEY not set or invalid" };
  }

  if (!text || text.trim().length === 0) {
    return { translatedText: text, detectedLanguage: null, note: "Empty text" };
  }

  try {
    // Lightweight translate using gpt-4o-mini
    const system = `You are a translation engine. Translate the user text to ${targetLanguage}. Return only the translated text, no explanations.`;
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: text }
      ],
      temperature: 0.2,
      max_tokens: 1000,
    });
    
    const translatedText = res.choices?.[0]?.message?.content?.trim() || text;
    
    // If translation is the same as original, don't mark as translated
    if (translatedText === text) {
      return { translatedText: text, detectedLanguage: null, note: "No translation needed" };
    }
    
    return { translatedText };
  } catch (error) {
    console.error("Translation failed:", error.message);
    return { translatedText: text, detectedLanguage: null, note: "Translation failed" };
  }
}


