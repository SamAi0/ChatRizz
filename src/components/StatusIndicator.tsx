import React from 'react';

interface StatusIndicatorProps {
  isConnected: boolean;
  readyState?: number;
  reconnectAttempts?: number;
  connectionDuration?: number;
  lastActivity?: Date | null;
  errorMessage?: string | null;
  showDetails?: boolean;
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isConnected,
  readyState,
  reconnectAttempts = 0,
  connectionDuration = 0,
  lastActivity,
  errorMessage,
  showDetails = false,
  className = '',
}) => {
  const getStatusColor = () => {
    if (isConnected) return 'text-green-600';
    if (reconnectAttempts > 0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
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

  const getStatusText = () => {
    if (isConnected) return 'Connected';
    if (reconnectAttempts > 0) return `Reconnecting (${reconnectAttempts})`;
    return 'Disconnected';
  };

  const getReadyStateText = () => {
    if (!readyState) return '';
    
    switch (readyState) {
      case WebSocket.CONNECTING:
        return 'Connecting...';
      case WebSocket.OPEN:
        return 'Open';
      case WebSocket.CLOSING:
        return 'Closing...';
      case WebSocket.CLOSED:
        return 'Closed';
      default:
        return 'Unknown';
    }
  };

  const formatDuration = (duration: number) => {
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
    <div className={`flex items-center gap-2 ${className}`}>
      {getStatusIcon()}
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          
          {readyState && (
            <span className="text-xs text-gray-500">
              ({getReadyStateText()})
            </span>
          )}
        </div>
        
        {showDetails && (
          <div className="text-xs text-gray-500 space-y-1 mt-1">
            {isConnected && connectionDuration > 0 && (
              <div>Connected for {formatDuration(connectionDuration)}</div>
            )}
            
            {lastActivity && (
              <div>Last activity: {lastActivity.toLocaleTimeString()}</div>
            )}
            
            {errorMessage && (
              <div className="text-red-600">{errorMessage}</div>
            )}
            
            {reconnectAttempts > 0 && (
              <div className="text-orange-600">
                Reconnect attempt {reconnectAttempts}/5
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusIndicator; 