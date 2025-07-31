import React, { useState, useEffect } from 'react';
import StatusIndicator from './StatusIndicator';

interface StatusDashboardProps {
  isConnected: boolean;
  readyState?: number;
  reconnectAttempts?: number;
  connectionDuration?: number;
  lastActivity?: Date | null;
  errorMessage?: string | null;
  className?: string;
}

const StatusDashboard: React.FC<StatusDashboardProps> = ({
  isConnected,
  readyState,
  reconnectAttempts = 0,
  connectionDuration = 0,
  lastActivity,
  errorMessage,
  className = '',
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      if (isConnected && connectionDuration > 0) {
        setUptime(Date.now() - (connectionDuration));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected, connectionDuration]);

  const formatUptime = (duration: number) => {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getSystemHealth = () => {
    if (isConnected && !errorMessage) return 'excellent';
    if (isConnected && errorMessage) return 'good';
    if (reconnectAttempts > 0) return 'warning';
    return 'critical';
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent':
        return (
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        );
      case 'good':
        return (
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        );
      case 'warning':
        return (
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
        );
      case 'critical':
        return (
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        );
      default:
        return (
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
        );
    }
  };

  const systemHealth = getSystemHealth();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
        <div className="flex items-center gap-2">
          {getHealthIcon(systemHealth)}
          <span className={`text-sm font-medium ${getHealthColor(systemHealth)}`}>
            {systemHealth.charAt(0).toUpperCase() + systemHealth.slice(1)}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Connection Status */}
        <div className="border-b border-gray-200 pb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Connection Status</h4>
          <StatusIndicator
            isConnected={isConnected}
            readyState={readyState}
            reconnectAttempts={reconnectAttempts}
            connectionDuration={connectionDuration}
            lastActivity={lastActivity}
            errorMessage={errorMessage}
            showDetails={true}
          />
        </div>

        {/* System Information */}
        <div className="border-b border-gray-200 pb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">System Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Current Time:</span>
              <div className="font-medium">{currentTime.toLocaleTimeString()}</div>
            </div>
            <div>
              <span className="text-gray-500">Date:</span>
              <div className="font-medium">{currentTime.toLocaleDateString()}</div>
            </div>
            {isConnected && connectionDuration > 0 && (
              <>
                <div>
                  <span className="text-gray-500">Connection Duration:</span>
                  <div className="font-medium">{formatUptime(connectionDuration)}</div>
                </div>
                <div>
                  <span className="text-gray-500">System Uptime:</span>
                  <div className="font-medium">{formatUptime(uptime)}</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error Information */}
        {errorMessage && (
          <div className="border-b border-gray-200 pb-3">
            <h4 className="text-sm font-medium text-red-700 mb-2">Error Information</h4>
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <div className="text-sm text-red-700">
                  {errorMessage}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reconnection Status */}
        {reconnectAttempts > 0 && (
          <div>
            <h4 className="text-sm font-medium text-orange-700 mb-2">Reconnection Status</h4>
            <div className="bg-orange-50 border border-orange-200 rounded p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <div className="text-sm text-orange-700">
                  Attempting to reconnect... (Attempt {reconnectAttempts}/5)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {isConnected && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Performance Metrics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Response Time:</span>
                <div className="font-medium text-green-600">Good</div>
              </div>
              <div>
                <span className="text-gray-500">Message Queue:</span>
                <div className="font-medium text-green-600">Empty</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusDashboard; 