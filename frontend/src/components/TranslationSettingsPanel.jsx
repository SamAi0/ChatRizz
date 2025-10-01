import { useState, useEffect } from "react";
import { useTranslationStore } from "../store/useTranslationStore";
import { XIcon, LanguagesIcon, ToggleLeftIcon, ToggleRightIcon } from "lucide-react";

const TranslationSettingsPanel = ({ onClose }) => {
  const {
    preferredLanguage,
    autoTranslate,
    showOriginal,
    setPreferredLanguage,
    setAutoTranslate,
    setShowOriginal,
    supportedLanguages,
    languagesLoaded,
    loadSupportedLanguages
  } = useTranslationStore();

  const [localPreferredLanguage, setLocalPreferredLanguage] = useState(preferredLanguage);
  const [localAutoTranslate, setLocalAutoTranslate] = useState(autoTranslate);
  const [localShowOriginal, setLocalShowOriginal] = useState(showOriginal);

  // Load supported languages on component mount
  useEffect(() => {
    if (!languagesLoaded) {
      loadSupportedLanguages();
    }
  }, [languagesLoaded, loadSupportedLanguages]);

  const handleSave = () => {
    setPreferredLanguage(localPreferredLanguage);
    setAutoTranslate(localAutoTranslate);
    setShowOriginal(localShowOriginal);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <div className="flex items-center gap-2">
            <LanguagesIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Translation Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 max-h-[calc(80vh-120px)] overflow-y-auto">
          {/* Translation Status */}
          <div className="alert alert-info">
            <div className="flex items-center gap-2">
              <div className="badge badge-success">ACTIVE</div>
              <div>
                <div className="font-medium">RapidAPI Translation</div>
                <div className="text-sm opacity-75">
                  Primary translation provider: RapidAPI
                </div>
              </div>
            </div>
          </div>

          {/* Preferred Language */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <LanguagesIcon className="w-4 h-4 text-primary" />
              <h4 className="font-medium">Preferred Language</h4>
            </div>
            <select
              value={localPreferredLanguage}
              onChange={(e) => setLocalPreferredLanguage(e.target.value)}
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
                onClick={() => setLocalAutoTranslate(!localAutoTranslate)}
                className="flex items-center gap-2"
              >
                {localAutoTranslate ? (
                  <ToggleRightIcon className="w-6 h-6 text-primary" />
                ) : (
                  <ToggleLeftIcon className="w-6 h-6 text-base-content/40" />
                )}
              </button>
            </div>
            <p className="text-sm text-base-content/60">
              Automatically translate incoming messages to your preferred language in real-time (no buttons required)
            </p>
          </div>

          {/* Show Original */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="font-medium">Show Original Text</div>
              </div>
              <button
                onClick={() => setLocalShowOriginal(!localShowOriginal)}
                className="flex items-center gap-2"
              >
                {localShowOriginal ? (
                  <ToggleRightIcon className="w-6 h-6 text-primary" />
                ) : (
                  <ToggleLeftIcon className="w-6 h-6 text-base-content/40" />
                )}
              </button>
            </div>
            <p className="text-sm text-base-content/60">
              Display the original text alongside translations
            </p>
          </div>

          {/* Real-time Translation Info */}
          <div className="alert alert-success">
            <div>
              <div className="font-medium">Real-time Translation</div>
              <div className="text-sm">
                Messages are automatically translated as they arrive when Auto Translate is enabled.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-base-300">
          <button
            onClick={onClose}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranslationSettingsPanel;