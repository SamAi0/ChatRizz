import React from 'react';
import { Message as MessageType } from '../types';

interface MessageProps {
  message: MessageType;
  isLastMessage?: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isLastMessage = false }) => {
  const isOwnMessage = message.sender === 'user';
  
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} m-2 animate-fade-in`}>
      {/* Sender Info */}
      <div className={`flex items-center gap-1.5 mb-1 text-xs text-secondary-500 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
        <span className="font-medium">{message.senderName || 'Unknown'}</span>
        {message.srcLang && (
          <span className="text-xs">{getLanguageFlag(message.srcLang)}</span>
        )}
        {message.destLang && message.srcLang !== message.destLang && (
          <>
            <span className="text-xs">→</span>
            <span className="text-xs">{getLanguageFlag(message.destLang)}</span>
          </>
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[70%] p-3 rounded-2xl relative break-words animate-scale-in ${
          isOwnMessage 
            ? 'bg-primary-500 text-white rounded-br-sm' 
            : 'bg-secondary-100 text-secondary-900 rounded-bl-sm'
        }`}
      >
        {/* Original Text (faded) */}
        {message.text !== message.translatedText && (
          <div className={`mb-2 text-sm ${isOwnMessage ? 'text-primary-100' : 'text-secondary-500'}`}>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs font-medium">Original</span>
              <span className="text-xs">{getLanguageFlag(message.srcLang)}</span>
            </div>
            <p className="leading-relaxed">{message.text}</p>
          </div>
        )}

        {/* Translated Text */}
        <div>
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs font-medium">Translated</span>
            <span className="text-xs">{getLanguageFlag(message.destLang)}</span>
          </div>
          <p className="leading-relaxed">{message.translatedText}</p>
        </div>

        {/* Timestamp */}
        <div className={`text-xs mt-2 ${isOwnMessage ? 'text-primary-200' : 'text-secondary-500'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default Message; 