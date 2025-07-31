import React, { useState, useEffect, useRef } from 'react';
import { Message as MessageType, ChatUser, User, Settings } from '../types';
import { useWebSocket } from '../hooks/useWebSocket';
import Message from './Message';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import SettingsModal from './SettingsModal';

interface ChatContainerProps {
  user: ChatUser;
  currentUser?: User;
  initialMessages?: MessageType[];
}

const ChatContainer: React.FC<ChatContainerProps> = ({ 
  user, 
  currentUser,
  initialMessages = [] 
}) => {
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // WebSocket hook for real-time messaging
  const {
    sendJsonMessage,
    isConnected,
    reconnectAttempts,
    connectionDuration,
    lastActivity,
    errorMessage,
  } = useWebSocket({
    roomId: user.id, // Use user ID as room ID
    onMessage: (wsMessage: any) => {
      if (wsMessage.type === 'chat_message') {
        const newMessage: MessageType = {
          id: wsMessage.id || Date.now().toString(),
          text: wsMessage.text,
          srcLang: wsMessage.srcLang,
          destLang: wsMessage.destLang,
          translatedText: wsMessage.translatedText,
          senderId: wsMessage.senderId,
          timestamp: new Date(wsMessage.timestamp || Date.now()),
          sender: wsMessage.senderId === currentUser?.id ? 'user' : 'other',
          senderName: wsMessage.senderName || 'Unknown',
          senderLanguage: wsMessage.srcLang,
        };
        setMessages(prev => [...prev, newMessage]);
      } else if (wsMessage.type === 'typing') {
        setIsTyping(wsMessage.data.isTyping);
      }
    },
    onOpen: () => {
      console.log('WebSocket connected to chat room');
      setStatusMessage('Connected to chat room');
    },
    onClose: () => {
      console.log('WebSocket disconnected from chat room');
      setStatusMessage('Disconnected from chat room');
    },
    onError: (error: Event) => {
      console.error('WebSocket error:', error);
      setStatusMessage('Connection error occurred');
    },
    onStatusChange: (status: string) => {
      setStatusMessage(status);
    },
  });

  // Default settings
  const [settings, setSettings] = useState<Settings>({
    language: currentUser?.language || 'en',
    theme: 'light',
    fontSize: 14,
  });

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 100;
  };

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (isNearBottom()) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    // Initial scroll to bottom
    scrollToBottom('auto');
  }, []);

  // Apply theme changes
  useEffect(() => {
    document.body.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Apply font size changes
  useEffect(() => {
    document.documentElement.style.setProperty('--font-size', `${settings.fontSize}px`);
  }, [settings.fontSize]);

  const handleSendMessage = (text: string) => {
    const newMessage: MessageType = {
      id: Date.now().toString(),
      text,
      srcLang: currentUser?.language || 'en',
      destLang: user.language || 'en',
      translatedText: text, // In a real app, this would be translated by the server
      senderId: currentUser?.id || 'user',
      timestamp: new Date(),
      sender: 'user',
      senderName: currentUser?.name || 'You',
      senderLanguage: currentUser?.language || 'en',
    };

    setMessages(prev => [...prev, newMessage]);

    // Send message via WebSocket
    if (isConnected) {
      sendJsonMessage({
        type: 'chat_message',
        id: newMessage.id,
        text: newMessage.text,
        srcLang: newMessage.srcLang,
        destLang: newMessage.destLang,
        translatedText: newMessage.translatedText,
        senderId: newMessage.senderId,
        timestamp: newMessage.timestamp.toISOString(),
        senderName: newMessage.senderName,
        room: user.id,
      });
    } else {
      // Fallback: simulate typing indicator and response if WebSocket not connected
      setTimeout(() => {
        setIsTyping(true);
        
        setTimeout(() => {
          const response: MessageType = {
            id: (Date.now() + 1).toString(),
            text: `Thanks for your message: "${text}"`,
            srcLang: user.language || 'en',
            destLang: currentUser?.language || 'en',
            translatedText: `Gracias por tu mensaje: "${text}"`,
            senderId: user.id,
            timestamp: new Date(),
            sender: 'other',
            senderName: user.name,
            senderLanguage: user.language,
          };
          
          setMessages(prev => [...prev, response]);
          setIsTyping(false);
        }, 1500);
      }, 500);
    }
  };

  const handleScroll = () => {
    // Optional: Add scroll handling logic here
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handleSettingsChange = (newSettings: Settings) => {
    setSettings(newSettings);
  };

  const formatConnectionDuration = (duration: number) => {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-secondary-50 transition-colors duration-300">
      <ChatHeader 
        user={user} 
        onSettingsClick={handleSettingsClick}
        isConnected={isConnected}
        reconnectAttempts={reconnectAttempts}
      />
      
      {/* Status Bar */}
      {!isConnected && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-red-700 font-medium">
              {errorMessage || statusMessage}
            </span>
            {reconnectAttempts > 0 && (
              <span className="text-xs text-red-600">
                (Attempt {reconnectAttempts}/5)
              </span>
            )}
          </div>
        </div>
      )}
      
      {isConnected && connectionDuration > 0 && (
        <div className="px-4 py-1 bg-green-50 border-b border-green-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-700">
              Connected for {formatConnectionDuration(connectionDuration)}
            </span>
            {lastActivity && (
              <span className="text-xs text-green-600">
                • Last activity: {lastActivity.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      )}
      
      <div 
        className="flex-1 overflow-y-auto p-0 bg-secondary-50 scroll-smooth transition-colors duration-300"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {messages.map((message, index) => (
          <Message 
            key={message.id} 
            message={message} 
            isLastMessage={index === messages.length - 1}
          />
        ))}
        
        {isTyping && (
          <div className="flex flex-col items-start m-2">
            <div className="flex items-center gap-1.5 mb-1 text-xs text-secondary-500">
              <span className="font-medium">{user.name}</span>
              {user.language && (
                <span className="text-xs">{getLanguageFlag(user.language)}</span>
              )}
            </div>
            <div className="max-w-[70%] p-3 rounded-2xl relative break-words bg-secondary-100 text-secondary-900 rounded-bl-sm">
              <div className="flex items-center gap-1 p-2">
                <span className="w-2 h-2 bg-secondary-500 rounded-full animate-typing"></span>
                <span className="w-2 h-2 bg-secondary-500 rounded-full animate-typing" style={{ animationDelay: '-0.16s' }}></span>
                <span className="w-2 h-2 bg-secondary-500 rounded-full animate-typing" style={{ animationDelay: '-0.32s' }}></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <MessageInput 
        onSendMessage={handleSendMessage} 
        userLanguage={currentUser?.language || 'en'}
        disabled={!isConnected}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
};

// Helper function to get language flag
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

export default ChatContainer; 