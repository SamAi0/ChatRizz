import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  data?: any;
  room?: string;
  sender?: string;
  timestamp?: string;
  // New message structure
  id?: string;
  text?: string;
  srcLang?: string;
  destLang?: string;
  translatedText?: string;
  senderId?: string;
  senderName?: string;
}

interface UseWebSocketOptions {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  roomId?: string;
  onMessage?: (message: WebSocketMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onStatusChange?: (status: string) => void;
}

interface WebSocketStatus {
  readyState: number;
  isConnected: boolean;
  reconnectAttempts: number;
  connectionDuration: number;
  lastActivity: Date | null;
  errorMessage: string | null;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    url = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:8080',
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    roomId: providedRoomId,
    onMessage,
    onOpen,
    onClose,
    onError,
    onStatusChange,
  } = options;

  const [status, setStatus] = useState<WebSocketStatus>({
    readyState: WebSocket.CONNECTING,
    isConnected: false,
    reconnectAttempts: 0,
    connectionDuration: 0,
    lastActivity: null,
    errorMessage: null,
  });
  
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const connectionStartTimeRef = useRef<number | null>(null);
  const statusUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get roomId from URL if not provided
  const getRoomIdFromUrl = useCallback(() => {
    if (providedRoomId) return providedRoomId;
    
    // Extract room ID from URL path if it matches /room/:id pattern
    if (typeof window !== 'undefined') {
      const pathMatch = window.location.pathname.match(/\/room\/([^/]+)/);
      return pathMatch ? pathMatch[1] : undefined;
    }
    return undefined;
  }, [providedRoomId]);

  const roomId = getRoomIdFromUrl();

  const getStatusText = useCallback((readyState: number) => {
    switch (readyState) {
      case WebSocket.CONNECTING:
        return 'Connecting...';
      case WebSocket.OPEN:
        return 'Connected';
      case WebSocket.CLOSING:
        return 'Closing...';
      case WebSocket.CLOSED:
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  }, []);

  const updateStatus = useCallback((updates: Partial<WebSocketStatus>) => {
    setStatus(prev => {
      const newStatus = { ...prev, ...updates };
      onStatusChange?.(getStatusText(newStatus.readyState));
      return newStatus;
    });
  }, [onStatusChange, getStatusText]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        connectionStartTimeRef.current = Date.now();
        
        updateStatus({
          readyState: WebSocket.OPEN,
          isConnected: true,
          reconnectAttempts: 0,
          errorMessage: null,
          lastActivity: new Date(),
        });
        
        reconnectAttemptsRef.current = 0;
        
        // Auto-subscribe to room if roomId exists
        if (roomId) {
          ws.send(JSON.stringify({
            type: 'subscribe',
            data: { roomId },
            room: roomId,
          }));
        }
        
        onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          updateStatus({ lastActivity: new Date() });
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
          updateStatus({ errorMessage: 'Failed to parse message' });
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        const errorMessage = event.code !== 1000 ? `Connection closed (Code: ${event.code})` : null;
        
        updateStatus({
          readyState: WebSocket.CLOSED,
          isConnected: false,
          errorMessage,
        });
        
        onClose?.();

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          updateStatus({ reconnectAttempts: reconnectAttemptsRef.current });
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        updateStatus({ errorMessage: 'Connection error occurred' });
        onError?.(error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      updateStatus({ 
        errorMessage: 'Failed to create connection',
        readyState: WebSocket.CLOSED,
        isConnected: false,
      });
    }
  }, [url, roomId, reconnectInterval, maxReconnectAttempts, onOpen, onMessage, onClose, onError, updateStatus]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (statusUpdateIntervalRef.current) {
      clearInterval(statusUpdateIntervalRef.current);
      statusUpdateIntervalRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    updateStatus({
      readyState: WebSocket.CLOSED,
      isConnected: false,
      reconnectAttempts: 0,
      connectionDuration: 0,
      lastActivity: null,
      errorMessage: null,
    });
    
    reconnectAttemptsRef.current = 0;
    connectionStartTimeRef.current = null;
  }, [updateStatus]);

  const sendJsonMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      updateStatus({ lastActivity: new Date() });
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
      updateStatus({ errorMessage: 'Cannot send message - not connected' });
    }
  }, [updateStatus]);

  const subscribeToRoom = useCallback((roomId: string) => {
    sendJsonMessage({
      type: 'subscribe',
      data: { roomId },
      room: roomId,
    });
  }, [sendJsonMessage]);

  const unsubscribeFromRoom = useCallback((roomId: string) => {
    sendJsonMessage({
      type: 'unsubscribe',
      data: { roomId },
      room: roomId,
    });
  }, [sendJsonMessage]);

  // Update connection duration when connected
  useEffect(() => {
    if (status.isConnected && connectionStartTimeRef.current) {
      statusUpdateIntervalRef.current = setInterval(() => {
        const duration = Date.now() - connectionStartTimeRef.current!;
        updateStatus({ connectionDuration: duration });
      }, 1000);
    }

    return () => {
      if (statusUpdateIntervalRef.current) {
        clearInterval(statusUpdateIntervalRef.current);
        statusUpdateIntervalRef.current = null;
      }
    };
  }, [status.isConnected, updateStatus]);

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Auto-subscribe to room when roomId changes
  useEffect(() => {
    if (status.isConnected && roomId) {
      subscribeToRoom(roomId);
    }
  }, [status.isConnected, roomId, subscribeToRoom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomId) {
        unsubscribeFromRoom(roomId);
      }
      disconnect();
    };
  }, [roomId, unsubscribeFromRoom, disconnect]);

  return {
    sendJsonMessage,
    lastMessage,
    readyState: status.readyState,
    isConnected: status.isConnected,
    reconnectAttempts: status.reconnectAttempts,
    connectionDuration: status.connectionDuration,
    lastActivity: status.lastActivity,
    errorMessage: status.errorMessage,
    subscribeToRoom,
    unsubscribeFromRoom,
    connect,
    disconnect,
  };
}; 