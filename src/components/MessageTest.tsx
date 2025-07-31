import React, { useState } from 'react';
import { Message as MessageType } from '../types';
import Message from './Message';

const MessageTest: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: '1',
      text: 'Hello! How are you today?',
      srcLang: 'en',
      destLang: 'es',
      translatedText: '¡Hola! ¿Cómo estás hoy?',
      senderId: 'user-1',
      timestamp: new Date(Date.now() - 60000),
      sender: 'other',
      senderName: 'Alice',
      senderLanguage: 'en',
    },
    {
      id: '2',
      text: '¡Hola! Estoy muy bien, gracias por preguntar.',
      srcLang: 'es',
      destLang: 'en',
      translatedText: 'Hello! I\'m doing very well, thanks for asking.',
      senderId: 'user-2',
      timestamp: new Date(Date.now() - 30000),
      sender: 'user',
      senderName: 'You',
      senderLanguage: 'es',
    },
  ]);

  const addMessage = () => {
    const newMessage: MessageType = {
      id: Date.now().toString(),
      text: 'This is a test message with translation!',
      srcLang: 'en',
      destLang: 'es',
      translatedText: '¡Este es un mensaje de prueba con traducción!',
      senderId: 'user-1',
      timestamp: new Date(),
      sender: 'other',
      senderName: 'Alice',
      senderLanguage: 'en',
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = () => {
    const newMessage: MessageType = {
      id: Date.now().toString(),
      text: '¡Gracias por la demostración!',
      srcLang: 'es',
      destLang: 'en',
      translatedText: 'Thank you for the demonstration!',
      senderId: 'user-2',
      timestamp: new Date(),
      sender: 'user',
      senderName: 'You',
      senderLanguage: 'es',
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
          <h2 className="text-xl font-bold">Dual-Language Message Test</h2>
          <p className="text-blue-100 text-sm">
            Test the new message structure with original and translated text
          </p>
        </div>

        {/* Controls */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex gap-2">
            <button
              onClick={addMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Add Other Message
            </button>
            <button
              onClick={addUserMessage}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Add User Message
            </button>
            <button
              onClick={clearMessages}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="h-96 overflow-y-auto bg-gray-50 p-4">
          {messages.map((message, index) => (
            <Message 
              key={message.id} 
              message={message} 
              isLastMessage={index === messages.length - 1}
            />
          ))}

          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm">Click the buttons above to add messages</p>
              </div>
            </div>
          )}
        </div>

        {/* Features Info */}
        <div className="p-4 bg-white border-t">
          <h3 className="font-semibold text-gray-800 mb-2">Features:</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Original text (faded) + translated text</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Language flag indicators</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Smooth CSS animations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Real-time message rendering</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageTest; 