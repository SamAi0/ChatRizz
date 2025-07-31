import express from 'express';
import axios from 'axios';

const router = express.Router();

// Example: Google Translate API (replace with your API key and endpoint)
const GOOGLE_TRANSLATE_API_KEY = 'YOUR_API_KEY';
const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2';

router.post('/', async (req, res) => {
  const { text, target } = req.body;
  try {
    const response = await axios.post(GOOGLE_TRANSLATE_URL, null, {
      params: {
        q: text,
        target,
        key: GOOGLE_TRANSLATE_API_KEY,
      },
    });
    res.json({ translated: response.data.data.translations[0].translatedText });
  } catch (err) {
    res.status(500).json({ error: 'Translation failed', details: err.message });
  }
});

export default router; 