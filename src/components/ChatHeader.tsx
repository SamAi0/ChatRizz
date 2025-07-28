import React from 'react';
import { Phone, Video, Search, MoreVertical } from 'lucide-react';

interface ChatHeaderProps {
  contact: {
    name: string;
    avatar: string;
    isOnline: boolean;
    lastSeen?: string;
    isGroup?: boolean;
    participantCount?: number;
  };
  onSearchToggle?: () => void;
}

export default function ChatHeader({ contact, onSearchToggle }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 border-b border-purple-400/30 backdrop-blur-sm">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img
            src={contact.avatar}
            alt={contact.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/50"
          />
          {contact.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 border-2 border-white rounded-full shadow-lg"></div>
          )}
        </div>
        <div>
          <h2 className="font-semibold text-white">{contact.name}</h2>
          <p className="text-sm text-purple-100">
            {contact.isGroup 
              ? `${contact.participantCount} participants`
              : contact.isOnline 
                ? 'online' 
                : contact.lastSeen || 'last seen recently'
            }
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
          <Phone size={20} />
        </button>
        <button className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
          <Video size={20} />
        </button>
        <button 
          onClick={onSearchToggle}
          className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
        >
          <Search size={20} />
        </button>
        <button className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
}