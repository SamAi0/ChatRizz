import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  userLanguage?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  placeholder = "Type a message...", 
  disabled = false,
  userLanguage = 'en'
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getLanguageFlag = (languageCode: string) => {
    const languageFlags: Record<string, string> = {
      'en': '🇺🇸',
      'es': '🇪🇸',
      'fr': '🇫🇷',
      'de': '🇩🇪',
      'it': '🇮🇹',
      'pt': '🇵🇹',
      'ru': '🇷🇺',
      'zh': '🇨🇳',
      'ja': '🇯🇵',
      'ko': '🇰🇷',
    };
    return languageFlags[languageCode] || '🇺🇸';
  };

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    if (value.trim() && !isTyping) {
      setIsTyping(true);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="p-4 bg-white border-t border-secondary-200">
      <div className="flex items-center gap-3 bg-secondary-50 rounded-3xl p-2 border border-secondary-200 transition-colors focus-within:border-primary-500 focus-within:shadow-lg focus-within:shadow-primary-500/10">
        <div className="text-base flex-shrink-0 opacity-80">
          {getLanguageFlag(userLanguage)}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 border-none bg-transparent outline-none text-sm text-secondary-900 placeholder:text-secondary-500 disabled:opacity-60 disabled:cursor-not-allowed"
        />
        
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="flex items-center justify-center w-9 h-9 border-none rounded-full bg-primary-500 text-white cursor-pointer transition-all duration-200 flex-shrink-0 hover:bg-primary-600 hover:scale-105 disabled:bg-secondary-500 disabled:cursor-not-allowed disabled:transform-none"
          title="Send message"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path
              d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
      
      {isTyping && (
        <div className="flex items-center justify-center mt-2 text-xs text-secondary-500 italic">
          <span className="animate-pulse">Typing...</span>
        </div>
      )}
    </div>
  );
};

export default MessageInput; 