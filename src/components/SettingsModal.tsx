import React, { useState } from 'react';
import { Settings, Language } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);

  const languages: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
  ];

  const handleSettingChange = (key: keyof Settings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-lg max-h-[90vh] overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 pb-0 border-b border-secondary-200 mb-6">
          <h2 className="text-2xl font-bold text-secondary-900">Settings</h2>
          <button 
            className="bg-none border-none text-secondary-500 cursor-pointer p-2 rounded-lg transition-colors hover:bg-secondary-100 hover:text-secondary-900 flex items-center justify-center"
            onClick={onClose}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="px-6 max-h-[60vh] overflow-y-auto">
          {/* Language Preference */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-secondary-900 mb-3">Language Preference</h3>
            <div className="flex flex-col gap-3">
              <select
                value={localSettings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="p-3 border-2 border-secondary-200 rounded-lg text-sm bg-white cursor-pointer transition-colors focus:border-primary-500 focus:outline-none focus:shadow-lg focus:shadow-primary-500/10"
              >
                {languages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.flag} {language.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-secondary-900 mb-3">Theme</h3>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <button
                  className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    localSettings.theme === 'light' 
                      ? 'border-primary-500 bg-primary-500 text-white' 
                      : 'border-secondary-200 bg-white text-secondary-500 hover:border-primary-500 hover:text-primary-500'
                  }`}
                  onClick={() => handleSettingChange('theme', 'light')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>Light</span>
                </button>
                <button
                  className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    localSettings.theme === 'dark' 
                      ? 'border-primary-500 bg-primary-500 text-white' 
                      : 'border-secondary-200 bg-white text-secondary-500 hover:border-primary-500 hover:text-primary-500'
                  }`}
                  onClick={() => handleSettingChange('theme', 'dark')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </div>

          {/* Font Size Slider */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-secondary-900 mb-3">Font Size</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="text-xs text-secondary-500 font-medium">Small</span>
                <input
                  type="range"
                  min="12"
                  max="20"
                  value={localSettings.fontSize}
                  onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
                  className="flex-1 h-1.5 bg-secondary-200 rounded-full outline-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:shadow-md"
                />
                <span className="text-xs text-secondary-500 font-medium">Large</span>
              </div>
              <div className="flex items-center justify-center p-3 bg-secondary-50 rounded-lg border border-secondary-200">
                <span style={{ fontSize: `${localSettings.fontSize}px` }} className="text-secondary-900 font-medium">
                  Preview Text
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-secondary-200 mt-6">
          <button 
            className="flex-1 py-3 px-6 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 bg-secondary-50 text-secondary-500 border border-secondary-200 hover:bg-secondary-100 hover:text-secondary-700"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button 
            className="flex-1 py-3 px-6 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 bg-primary-500 text-white hover:bg-primary-600"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 