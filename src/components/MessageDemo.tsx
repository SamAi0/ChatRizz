import React, { useState, useEffect } from 'react';
import { Message as MessageType } from '../types';
import Message from './Message';

const MessageDemo: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  const demoMessages: MessageType[] = [
    {
      id: '1',
      text: 'Hello! How are you today?',
      srcLang: 'en',
      destLang: 'es',
      translatedText: '¡Hola! ¿Cómo estás hoy?',
      senderId: 'demo-user-1',
      timestamp: new Date(),
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
      senderId: 'demo-user-2',
      timestamp: new Date(),
      sender: 'user',
      senderName: 'You',
      senderLanguage: 'es',
    },
    {
      id: '3',
      text: 'That\'s wonderful! What have you been working on?',
      srcLang: 'en',
      destLang: 'es',
      translatedText: '¡Eso es maravilloso! ¿En qué has estado trabajando?',
      senderId: 'demo-user-1',
      timestamp: new Date(),
      sender: 'other',
      senderName: 'Alice',
      senderLanguage: 'en',
    },
    {
      id: '4',
      text: 'He estado trabajando en un proyecto muy emocionante.',
      srcLang: 'es',
      destLang: 'en',
      translatedText: 'I\'ve been working on a very exciting project.',
      senderId: 'demo-user-2',
      timestamp: new Date(),
      sender: 'user',
      senderName: 'You',
      senderLanguage: 'es',
    },
    {
      id: '5',
      text: 'Tell me more about it!',
      srcLang: 'en',
      destLang: 'es',
      translatedText: '¡Cuéntame más sobre eso!',
      senderId: 'demo-user-1',
      timestamp: new Date(),
      sender: 'other',
      senderName: 'Alice',
      senderLanguage: 'en',
    },
  ];

  const startDemo = () => {
    setIsDemoRunning(true);
    setMessages([]);
  };

  const stopDemo = () => {
    setIsDemoRunning(false);
  };

  const resetDemo = () => {
    setIsDemoRunning(false);
    setMessages([]);
  };

  useEffect(() => {
    if (!isDemoRunning) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < demoMessages.length) {
        const message = {
          ...demoMessages[currentIndex],
          id: `${Date.now()}-${currentIndex}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, message]);
        currentIndex++;
      } else {
        setIsDemoRunning(false);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isDemoRunning]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
          <h2 className="text-xl font-bold">Real-time Message Demo</h2>
          <p className="text-blue-100 text-sm">
            Watch messages appear with dual-language display and smooth animations
          </p>
        </div>

        {/* Controls */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex gap-2">
            <button
              onClick={startDemo}
              disabled={isDemoRunning}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Start Demo
            </button>
            <button
              onClick={stopDemo}
              disabled={!isDemoRunning}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Stop Demo
            </button>
            <button
              onClick={resetDemo}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
          </div>
          
          {isDemoRunning && (
            <div className="mt-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">
                Demo running - messages appearing every 2 seconds
              </span>
            </div>
          )}
        </div>

        {/* Messages Container */}
        <div className="h-96 overflow-y-auto bg-gray-50 p-4">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Message 
                message={message} 
                isLastMessage={index === messages.length - 1}
              />
            </div>
          ))}

          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm">Click "Start Demo" to see messages appear</p>
              </div>
            </div>
          )}
        </div>

        {/* Features List */}
        <div className="p-4 bg-white border-t">
          <h3 className="font-semibold text-gray-800 mb-2">Features Demonstrated:</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Dual-language display</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>CSS animations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Real-time message rendering</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Language flag indicators</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDemo; 