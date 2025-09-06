function LanguageSettings({ preferredLanguage, setPreferredLanguage }) {
  try {
    const languages = [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Spanish', flag: '🇪🇸' },
      { code: 'fr', name: 'French', flag: '🇫🇷' },
      { code: 'de', name: 'German', flag: '🇩🇪' },
      { code: 'it', name: 'Italian', flag: '🇮🇹' },
      { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
      { code: 'ru', name: 'Russian', flag: '🇷🇺' },
      { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
      { code: 'ko', name: 'Korean', flag: '🇰🇷' },
      { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
      { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
      { code: 'hi', name: 'Hindi', flag: '🇮🇳' }
    ];

    return (
      <div className="setting-card" data-name="language-settings" data-file="components/LanguageSettings.js">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Language Preferences</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
              Preferred Language for Translation
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => setPreferredLanguage(language.code)}
                  className={`flex items-center p-3 rounded-lg border transition-colors ${
                    preferredLanguage === language.code
                      ? 'border-[var(--primary-color)] bg-[var(--primary-color)] bg-opacity-10'
                      : 'border-[var(--border-color)] hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl mr-3">{language.flag}</span>
                  <span className={`font-medium ${
                    preferredLanguage === language.code ? 'text-[var(--primary-color)]' : 'text-[var(--text-primary)]'
                  }`}>
                    {language.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="icon-info text-blue-500 mr-2 mt-0.5"></div>
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Automatic Translation</p>
                <p>Messages will be automatically translated to your preferred language when chatting with users who speak different languages.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('LanguageSettings component error:', error);
    return null;
  }
}
