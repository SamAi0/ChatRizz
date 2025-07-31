import React from 'react';

interface MessageReactionsProps {
  messageId: string;
  reactions: { [emoji: string]: string[] };
  onAddReaction: (messageId: string, emoji: string) => void;
  currentUserId: string;
}

export default function MessageReactions({ messageId, reactions, onAddReaction, currentUserId }: MessageReactionsProps) {
  const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  const hasUserReacted = (emoji: string) => {
    return reactions[emoji]?.includes(currentUserId);
  };

  return (
    <div className="flex items-center space-x-1 mt-1">
      {reactionEmojis.map((emoji) => {
        const count = reactions[emoji]?.length || 0;
        const userReacted = hasUserReacted(emoji);
        
        return (
          <button
            key={emoji}
            onClick={() => onAddReaction(messageId, emoji)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-all duration-200 ${
              userReacted
                ? 'bg-purple-500/30 border border-purple-400'
                : count > 0
                ? 'bg-gray-700/50 border border-gray-600 hover:bg-purple-500/20'
                : 'opacity-0 hover:opacity-100 bg-gray-700/30 hover:bg-purple-500/20'
            }`}
          >
            <span>{emoji}</span>
            {count > 0 && <span className="text-purple-200">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}