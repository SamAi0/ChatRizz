import React, { useState, useEffect } from 'react';
import { useTranslationStore } from '../store/useTranslationStore';
import { Languages, Loader2, RotateCcw, Eye, EyeOff, X } from 'lucide-react';

const TranslationPanel = ({ message, onClose }) => {
  const {
    supportedLanguages,
    languagesLoaded,
    preferredLanguage,
    loadSupportedLanguages,
    translateMessage,
    getMessageTranslation,
    isMessageTranslating,
    setPreferredLanguage
  } = useTranslationStore();

  const [selectedLanguage, setSelectedLanguage] = useState(preferredLanguage);
  const [translation, setTranslation] = useState(null);
  const [showOriginal, setShowOriginal] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!languagesLoaded) {
      loadSupportedLanguages();
    }
  }, [languagesLoaded, loadSupportedLanguages]);

  useEffect(() => {
    if (message && selectedLanguage) {
      handleTranslate();
    }
  }, [message, selectedLanguage]);

  const handleTranslate = async () => {
    if (!message || !selectedLanguage) return;

    try {
      setError(null);
      
      // Check if translation already exists
      const cached = getMessageTranslation(message._id, 'auto', selectedLanguage);
      if (cached) {
        setTranslation(cached);
        return;
      }

      const result = await translateMessage(
        message._id,
        message.text,
        'auto',
        selectedLanguage
      );
      
      setTranslation(result);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode);
    setPreferredLanguage(langCode);
  };

  const isTranslating = isMessageTranslating(message?._id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Message Translation</h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[calc(80vh-120px)] overflow-y-auto">
          {/* Language Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Translate to:</label>
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="select select-bordered w-full"
              disabled={!languagesLoaded}
            >
              {languagesLoaded ? (
                Object.entries(supportedLanguages).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))
              ) : (
                <option disabled>Loading languages...</option>
              )}
            </select>
          </div>

          {/* Original Message */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Original Message:</label>
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className="btn btn-ghost btn-xs"
              >
                {showOriginal ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showOriginal ? 'Hide' : 'Show'}
              </button>
            </div>
            {showOriginal && (
              <div className="p-3 bg-base-200 rounded-lg">
                <p className="text-sm">{message?.text}</p>
                <div className="text-xs text-base-content/60 mt-2">
                  From: {message?.senderId?.fullName || 'Unknown'}
                </div>
              </div>
            )}
          </div>

          {/* Translation */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Translation:</label>
              {isTranslating && <Loader2 className="w-4 h-4 animate-spin" />}
            </div>

            {error ? (
              <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
                <p className="text-error text-sm">{error}</p>
                <button
                  onClick={handleTranslate}
                  className="btn btn-error btn-xs mt-2"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Retry
                </button>
              </div>
            ) : translation ? (
              <div className="space-y-3">
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm">{translation.translatedText}</p>
                  <div className="text-xs text-base-content/60 mt-2 flex items-center justify-between">
                    <span>
                      {translation.fromLanguage} → {translation.toLanguage}
                    </span>
                    {translation.cached && (
                      <span className="badge badge-ghost badge-xs">Cached</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-base-200 rounded-lg">
                <p className="text-sm text-base-content/60">
                  {isTranslating ? 'Translating...' : 'Select a language to translate'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-base-300">
          <div className="text-xs text-base-content/60">
            Powered by RapidAPI Translation
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleTranslate}
              className="btn btn-primary btn-sm"
              disabled={isTranslating || !selectedLanguage}
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="w-4 h-4 mr-1" />
                  Translate
                </>
              )}
            </button>
            <button onClick={onClose} className="btn btn-ghost btn-sm">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationPanel;