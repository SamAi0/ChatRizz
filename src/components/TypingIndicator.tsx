import React from 'react';

interface TypingIndicatorProps {
  contactName: string;
}

export default function TypingIndicator({ contactName }: TypingIndicatorProps) {
  return (
    <div className="flex items-center space-x-2 p-3 mb-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span className="text-sm text-purple-200">{contactName} is typing...</span>
    </div>
  );
}