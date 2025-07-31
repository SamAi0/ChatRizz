import React from 'react';
import { Check, CheckCheck, Play, Pause } from 'lucide-react';
import MessageReactions from './MessageReactions';

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

interface MessageBubbleProps {
  message: Message;
  onAddReaction?: (messageId: string, emoji: string) => void;
  searchQuery?: string;
}

export default function MessageBubble({ message, onAddReaction, searchQuery }: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check size={16} className="text-gray-400" />;
      case 'delivered':
        return <CheckCheck size={16} className="text-gray-400" />;
      case 'read':
        return <CheckCheck size={16} className="text-blue-500" />;
      default:
        return null;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-300 text-black">$1</mark>');
  };
  return (
    <div className={`flex ${message.isSent ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-lg ${
          message.isSent
            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
            : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white border border-purple-500/20'
        }`}
      >
        {message.type === 'image' && message.mediaUrl && (
          <img
            src={message.mediaUrl}
            alt="Shared image"
            className="rounded-lg mb-2 max-w-full h-auto"
          />
        )}
        
        {message.type === 'voice' && message.mediaUrl && (
          <div className="flex items-center space-x-3 min-w-[200px]">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-1 bg-white/30 rounded-full">
                  <div className="h-1 bg-white rounded-full w-1/3"></div>
                </div>
                {message.duration && (
                  <span className="text-xs opacity-70">{formatDuration(message.duration)}</span>
                )}
              </div>
            </div>
            <audio src={message.mediaUrl} />
          </div>
        )}
        
        {message.type === 'text' && (
          <p 
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: searchQuery ? highlightText(message.text, searchQuery) : message.text 
            }}
          />
        )}
        
        <div className={`flex items-center justify-end mt-1 space-x-1 ${
          message.isSent ? 'text-white/80' : 'text-purple-200'
        }`}>
          <span className="text-xs opacity-70">{message.timestamp}</span>
          {message.isSent && getStatusIcon(message.status)}
        </div>
        
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <MessageReactions
            messageId={message.id}
            reactions={message.reactions}
            onAddReaction={onAddReaction || (() => {})}
            currentUserId="current-user"
          />
        )}
      </div>
    </div>
  );
}