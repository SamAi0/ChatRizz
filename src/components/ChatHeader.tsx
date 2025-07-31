import React from 'react';
import { ChatUser } from '../types';

interface ChatHeaderProps {
  user: ChatUser;
  onBack?: () => void;
  showBackButton?: boolean;
  onSettingsClick?: () => void;
  isConnected?: boolean;
  reconnectAttempts?: number;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  user, 
  onBack, 
  showBackButton = false,
  onSettingsClick,
  isConnected = true,
  reconnectAttempts = 0
}) => {
  const getConnectionStatusText = () => {
    if (isConnected) {
      return 'Connected';
    }
    if (reconnectAttempts > 0) {
      return `Reconnecting (${reconnectAttempts})`;
    }
    return 'Disconnected';
  };

  const getConnectionStatusColor = () => {
    if (isConnected) {
      return 'text-green-600';
    }
    if (reconnectAttempts > 0) {
      return 'text-orange-600';
    }
    return 'text-red-600';
  };

  const getConnectionStatusIcon = () => {
    if (isConnected) {
      return (
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      );
    }
    if (reconnectAttempts > 0) {
      return (
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
      );
    }
    return (
      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
    );
  };

  return (
    <div className="flex items-center p-4 bg-white border-b border-secondary-200 gap-3">
      {showBackButton && (
        <button 
          className="flex items-center justify-center w-10 h-10 border-none bg-transparent text-secondary-500 cursor-pointer rounded-full transition-colors hover:bg-secondary-100"
          onClick={onBack}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <path
              d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
              fill="currentColor"
            />
          </svg>
        </button>
      )}
      
      <div className="flex items-center gap-3 flex-1">
        <div className="relative w-10 h-10 rounded-full overflow-hidden">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary-500 text-white flex items-center justify-center font-bold text-base">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white ${
            user.isOnline ? 'bg-green-500' : 'bg-secondary-400'
          }`} />
        </div>
        
        <div className="flex-1">
          <h3 className="text-base font-semibold text-secondary-900 mb-0.5">{user.name}</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                user.isOnline ? 'bg-green-500' : 'bg-secondary-400'
              }`} />
              <p className="text-xs text-secondary-500">
                {user.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
            
            <div className="w-px h-3 bg-secondary-300"></div>
            
            <div className="flex items-center gap-1">
              {getConnectionStatusIcon()}
              <span className={`text-xs font-medium ${getConnectionStatusColor()}`}>
                {getConnectionStatusText()}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button 
          className="flex items-center justify-center w-10 h-10 border-none bg-transparent text-secondary-500 cursor-pointer rounded-full transition-colors hover:bg-secondary-100"
          onClick={onSettingsClick}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <path
              d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09A1.65 1.65 0 0 0 15.4 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09A1.65 1.65 0 0 0-1.51 15H15a1.65 1.65 0 0 0-1.51 1z"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader; 