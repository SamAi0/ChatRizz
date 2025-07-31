import React, { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import StatusIndicator from './StatusIndicator';

const WebSocketExample: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  const {
    sendJsonMessage,
    lastMessage,
    readyState,
    isConnected,
    reconnectAttempts,
    connectionDuration,
    lastActivity,
    errorMessage,
  } = useWebSocket({
    roomId: 'example-room',
    onMessage: (wsMessage) => {
      if (wsMessage.type === 'chat_message') {
        setMessages(prev => [...prev, `Received: ${wsMessage.data.text}`]);
      }
    },
    onOpen: () => {
      console.log('Connected to WebSocket');
    },
    onClose: () => {
      console.log('Disconnected from WebSocket');
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    },
  });

  const handleSendMessage = () => {
    if (message.trim()) {
      sendJsonMessage({
        type: 'chat_message',
        data: { text: message },
        room: 'example-room',
        timestamp: new Date().toISOString(),
      });
      setMessages(prev => [...prev, `Sent: ${message}`]);
      setMessage('');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">WebSocket Example</h2>
      
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
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

      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded"
            disabled={!isConnected}
          />
          <button
            onClick={handleSendMessage}
            disabled={!isConnected || !message.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            Send
          </button>
        </div>
      </div>

      <div className="border rounded p-3 h-64 overflow-y-auto">
        <h3 className="font-bold mb-2">Messages:</h3>
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm">No messages yet</p>
        ) : (
          <div className="space-y-2">
            {messages.map((msg, index) => (
              <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                {msg}
              </div>
            ))}
          </div>
        )}
      </div>

      {lastMessage && (
        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
          <h4 className="font-bold text-sm text-blue-800">Last WebSocket Message:</h4>
          <pre className="text-xs mt-1 overflow-x-auto text-blue-700">
            {JSON.stringify(lastMessage, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default WebSocketExample; 