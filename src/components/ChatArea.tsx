import React, { useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import SearchBar from './SearchBar';

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isSent: boolean;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file' | 'voice';
  mediaUrl?: string;
  duration?: number;
  reactions?: { [emoji: string]: string[] };
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
  isGroup?: boolean;
  participantCount?: number;
  isTyping?: boolean;
}

interface ChatAreaProps {
  contact: Contact;
  messages: Message[];
  onSendMessage: (message: string) => void;
  onSendVoice?: (audioBlob: Blob, duration: number) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
  searchQuery?: string;
  isSearching?: boolean;
  onSearch?: (query: string) => void;
  onCloseSearch?: () => void;
}

export default function ChatArea({ 
  contact, 
  messages, 
  onSendMessage, 
  onSendVoice, 
  onAddReaction,
  searchQuery,
  isSearching,
  onSearch,
  onCloseSearch
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <ChatHeader contact={contact} />
      
      {isSearching && onSearch && onCloseSearch && (
        <SearchBar onSearch={onSearch} onClose={onCloseSearch} />
      )}
      
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-2"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M30 30c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-28c15.5 0 28 12.5 28 28s-12.5 28-28 28S0 45.5 0 30 12.5 2 28 2z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-purple-200">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-xl">
                <img src={contact.avatar} alt={contact.name} className="w-16 h-16 rounded-full" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">{contact.name}</h3>
              <p className="text-sm">Start a conversation with {contact.name}</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                onAddReaction={onAddReaction}
                searchQuery={searchQuery}
              />
            ))}
            {contact.isTyping && <TypingIndicator contactName={contact.name} />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <MessageInput onSendMessage={onSendMessage} onSendVoice={onSendVoice} />
    </div>
  );
}