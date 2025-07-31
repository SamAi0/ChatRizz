import React from 'react';
import { MessageCircle } from 'lucide-react';

interface EmptyStateProps {
  isDarkMode?: boolean;
}

export default function EmptyState({ isDarkMode = true }: EmptyStateProps) {
  return (
    <div className={`flex-1 flex items-center justify-center ${
      isDarkMode 
        ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className="text-center">
        <div className={`w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl`}>
          <MessageCircle size={64} className={isDarkMode ? "text-white" : "text-white"} />
        </div>
        <h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          ChatRizz Web
        </h2>
        <p className={`mb-6 max-w-md ${isDarkMode ? 'text-purple-200' : 'text-gray-600'}`}>
          Send and receive messages without keeping your phone online.<br />
          Use ChatRizz on up to 4 linked devices and 1 phone at the same time.
        </p>
        <div className={`flex items-center justify-center space-x-2 text-sm ${
          isDarkMode ? 'text-purple-300' : 'text-gray-500'
        }`}>
          <span>🔒</span>
          <span>Your personal messages are end-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
}