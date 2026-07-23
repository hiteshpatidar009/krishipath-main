/**
 * translate.js
 * Uses the free, unofficial Google Translate endpoint to translate text.
 * Requires no API key and operates purely via client-side fetch.
 */

export const LANG_FIELDS = [
  { key: 'en', label: 'English' },
  { key: 'hi', label: 'Hindi' },
  { key: 'mr', label: 'Marathi' },
  { key: 'gu', label: 'Gujarati' },
  { key: 'te', label: 'Telugu' }
];

export const autoTranslate = async (text, targetLang) => {
  if (!text || !targetLang) return '';
  
  // Google Translate free public endpoint
  // sl = source language (en), tl = target language
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Translation failed');
    const data = await res.json();
    
    // The response is a deeply nested array. 
    // data[0] contains the translations blocks. data[0][0][0] is the translated string of the first block.
    // If the text has multiple sentences, it splits them into blocks.
    const translatedText = data[0].map(block => block[0]).join('');
    
    return translatedText;
  } catch (error) {
    console.error(`Error translating to ${targetLang}:`, error);
    return text; // Fallback to original text on error
  }
};

export const translateToAll = async (text, langs = ['hi', 'gu', 'mr', 'te']) => {
  if (!text) return {};
  
  const results = {};
  
  // Run all translations in parallel
  await Promise.all(
    langs.map(async (lang) => {
      results[lang] = await autoTranslate(text, lang);
    })
  );
  
  return results;
};
