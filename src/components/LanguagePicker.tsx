import React, { useState } from 'react';
import { Language } from '../types';
import './LanguagePicker.css';

interface LanguagePickerProps {
  selectedLanguage: string;
  onLanguageChange: (languageCode: string) => void;
}

const LanguagePicker: React.FC<LanguagePickerProps> = ({ 
  selectedLanguage, 
  onLanguageChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);

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

  const selectedLang = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  return (
    <div className="language-picker">
      <button 
        className="language-picker__button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="language-picker__flag">{selectedLang.flag}</span>
        <span className="language-picker__name">{selectedLang.name}</span>
        <svg 
          className={`language-picker__arrow ${isOpen ? 'open' : ''}`}
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none"
        >
          <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      </button>
      
      {isOpen && (
        <div className="language-picker__dropdown">
          {languages.map((language) => (
            <button
              key={language.code}
              className={`language-picker__option ${
                language.code === selectedLanguage ? 'selected' : ''
              }`}
              onClick={() => {
                onLanguageChange(language.code);
                setIsOpen(false);
              }}
            >
              <span className="language-picker__flag">{language.flag}</span>
              <span className="language-picker__name">{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguagePicker; 