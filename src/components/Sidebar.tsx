import React, { useState } from 'react';
import { Search, MessageCircle, MoreVertical, Users, Archive, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  isGroup?: boolean;
  isTyping?: boolean;
}

interface SidebarProps {
  contacts: Contact[];
  activeChat: string | null;
  onChatSelect: (contactId: string) => void;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
  userLanguage: string;
  setUserLanguage: (lang: string) => void;
}

export default function Sidebar({ contacts, activeChat, onChatSelect, isDarkMode = true, onThemeToggle, userLanguage, setUserLanguage }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full lg:w-96 bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 border-r border-purple-700/30 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm border-b border-purple-500/20">
        <div className="flex items-center space-x-3">
          <img
            src="https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150"
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-400/50"
          />
          <span className="font-medium text-white">My Profile</span>
          <select
            value={userLanguage}
            onChange={e => setUserLanguage(e.target.value)}
            className="ml-3 p-1 rounded bg-purple-800 text-white border border-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
            title="Select your language"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="zh">Chinese</option>
            <option value="hi">Hindi</option>
            <option value="ar">Arabic</option>
            <option value="ru">Russian</option>
            <option value="pt">Portuguese</option>
            <option value="ja">Japanese</option>
            {/* Add more languages as needed */}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-purple-200 hover:bg-white/10 rounded-full transition-colors">
            <Users size={20} />
          </button>
          <button className="p-2 text-purple-200 hover:bg-white/10 rounded-full transition-colors">
            <Archive size={20} />
          </button>
          {onThemeToggle && (
            <ThemeToggle isDark={isDarkMode} onToggle={onThemeToggle} />
          )}
          <button className="p-2 text-purple-200 hover:bg-white/10 rounded-full transition-colors">
            <Settings size={20} />
          </button>
          <button className="p-2 text-purple-200 hover:bg-white/10 rounded-full transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 bg-black/10 backdrop-blur-sm border-b border-purple-500/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={18} />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-purple-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-white placeholder-purple-200"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => onChatSelect(contact.id)}
            className={`flex items-center p-4 hover:bg-white/10 cursor-pointer transition-all duration-200 border-b border-purple-500/10 ${
              activeChat === contact.id ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-l-4 border-l-pink-400' : ''
            }`}
          >
            <div className="relative">
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-400/30"
              />
              {contact.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 border-2 border-purple-900 rounded-full shadow-lg"></div>
              )}
            </div>
            
            <div className="flex-1 ml-3 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white truncate">
                  {contact.name}
                  {contact.isGroup && <Users className="inline ml-1 text-purple-300" size={14} />}
                </h3>
                <span className="text-xs text-purple-200">{contact.timestamp}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-purple-100 truncate">{contact.lastMessage}</p>
                {contact.unreadCount > 0 && (
                  <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center shadow-lg">
                    {contact.unreadCount}
                  </span>
                )}
              </div>
              {contact.isTyping && (
                <div className="flex items-center space-x-1 mt-1">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-green-400">typing...</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}