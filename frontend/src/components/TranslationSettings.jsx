import React, { useState, useEffect } from 'react';
import { useTranslationStore } from '../store/useTranslationStore';
import { Settings, Languages, ToggleLeft, ToggleRight, Trash2, BarChart3 } from 'lucide-react';

const TranslationSettings = ({ onClose }) => {
  const {
    supportedLanguages,
    languagesLoaded,
    preferredLanguage,
    autoTranslate,
    showOriginal,
    loadSupportedLanguages,
    setPreferredLanguage,
    setAutoTranslate,
    setShowOriginal,
    clearTranslationCache,
    getCacheStats
  } = useTranslationStore();

  const [cacheStats, setCacheStats] = useState(null);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (!languagesLoaded) {
      loadSupportedLanguages();
    }
    loadCacheStats();
  }, [languagesLoaded, loadSupportedLanguages]);

  const loadCacheStats = async () => {
    try {
      const stats = await getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    }
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await clearTranslationCache();
      await loadCacheStats();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Translation Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 max-h-[calc(80vh-120px)] overflow-y-auto">
          {/* Demo Mode Notice */}
          <div className="alert alert-info">
            <div className="flex items-center gap-2">
              <div className="badge badge-warning">DEMO</div>
              <div>
                <div className="font-medium">Translation Demo Mode</div>
                <div className="text-sm opacity-75">
                  Translation service is in demo mode. Mock translations will be shown.
                </div>
              </div>
            </div>
          </div>

          {/* Preferred Language */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-primary" />
              <h4 className="font-medium">Preferred Language</h4>
            </div>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
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
            <p className="text-sm text-base-content/60">
              Messages will be translated to this language by default
            </p>
          </div>

          {/* Auto Translate */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="font-medium">Auto Translate</div>
              </div>
              <button
                onClick={() => setAutoTranslate(!autoTranslate)}
                className="flex items-center gap-2"
              >
                {autoTranslate ? (
                  <ToggleRight className="w-6 h-6 text-primary" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-base-content/40" />
                )}
              </button>
            </div>
            <p className="text-sm text-base-content/60">
              Automatically translate incoming messages to your preferred language
            </p>
          </div>

          {/* Show Original */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="font-medium">Show Original Text</div>
              </div>
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className="flex items-center gap-2"
              >
                {showOriginal ? (
                  <ToggleRight className="w-6 h-6 text-primary" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-base-content/40" />
                )}
              </button>
            </div>
            <p className="text-sm text-base-content/60">
              Display original text alongside translations
            </p>
          </div>

          {/* Cache Statistics */}
          {cacheStats && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h4 className="font-medium">Cache Statistics</h4>
              </div>
              <div className="bg-base-200 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Server Cache:</span>
                  <span>{cacheStats.server?.size || 0} entries</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Local Cache:</span>
                  <span>{cacheStats.local?.size || 0} entries</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Message Cache:</span>
                  <span>{cacheStats.messageCache?.size || 0} entries</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Currently Translating:</span>
                  <span>{cacheStats.messageCache?.translating || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Cache Management */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-error" />
              <h4 className="font-medium">Cache Management</h4>
            </div>
            <button
              onClick={handleClearCache}
              className="btn btn-error btn-sm w-full"
              disabled={isClearing}
            >
              {isClearing ? (
                <>
                  <div className="loading loading-spinner loading-xs mr-2"></div>
                  Clearing Cache...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Translation Cache
                </>
              )}
            </button>
            <p className="text-sm text-base-content/60">
              Clear all cached translations to save memory and ensure fresh results
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-base-300">
          <button onClick={onClose} className="btn btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranslationSettings;