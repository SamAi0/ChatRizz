# WebSocket Hook Documentation

This document describes the enhanced WebSocket hook implementation with comprehensive status management and real-time monitoring capabilities.

## Overview

The `useWebSocket` hook provides a robust WebSocket connection with automatic reconnection, detailed status tracking, and comprehensive error handling. It's designed to work seamlessly with React applications and provides real-time status updates.

## Features

### Enhanced Status Management
- **Real-time connection status** with visual indicators
- **Connection duration tracking** with formatted display
- **Last activity monitoring** for message timestamps
- **Detailed error reporting** with specific error messages
- **Reconnection attempt tracking** with progress indicators
- **System health monitoring** with status dashboard

### Visual Status Indicators
- **Color-coded status indicators** (green for connected, orange for reconnecting, red for disconnected)
- **Animated status icons** for reconnection attempts
- **Comprehensive status dashboard** with detailed metrics
- **Real-time status updates** with live timestamps

## Components

### StatusIndicator
A reusable component for displaying connection status with customizable detail levels.

```tsx
<StatusIndicator
  isConnected={isConnected}
  readyState={readyState}
  reconnectAttempts={reconnectAttempts}
  connectionDuration={connectionDuration}
  lastActivity={lastActivity}
  errorMessage={errorMessage}
  showDetails={true}
/>
```

### StatusDashboard
A comprehensive dashboard component for monitoring system health and connection status.

```tsx
<StatusDashboard
  isConnected={isConnected}
  readyState={readyState}
  reconnectAttempts={reconnectAttempts}
  connectionDuration={connectionDuration}
  lastActivity={lastActivity}
  errorMessage={errorMessage}
/>
```

## Hook Usage

### Basic Usage

```tsx
import { useWebSocket } from '../hooks/useWebSocket';

const MyComponent = () => {
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
    roomId: 'my-room',
    onMessage: (message) => {
      console.log('Received:', message);
    },
    onOpen: () => {
      console.log('Connected');
    },
    onClose: () => {
      console.log('Disconnected');
    },
    onError: (error) => {
      console.error('Error:', error);
    },
    onStatusChange: (status) => {
      console.log('Status changed:', status);
    },
  });

  return (
    <div>
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
  );
};
```

### Advanced Usage with Status Dashboard

```tsx
const ChatApp = () => {
  const [showStatusDashboard, setShowStatusDashboard] = useState(false);
  
  const {
    sendJsonMessage,
    isConnected,
    reconnectAttempts,
    connectionDuration,
    lastActivity,
    errorMessage,
  } = useWebSocket({
    roomId: 'chat-room',
    onMessage: handleMessage,
    onStatusChange: handleStatusChange,
  });

  return (
    <div className="flex h-screen">
      <div className="flex-1">
        <ChatContainer />
      </div>
      
      {showStatusDashboard && (
        <div className="w-80">
          <StatusDashboard
            isConnected={isConnected}
            reconnectAttempts={reconnectAttempts}
            connectionDuration={connectionDuration}
            lastActivity={lastActivity}
            errorMessage={errorMessage}
          />
        </div>
      )}
    </div>
  );
};
```

## Status Properties

### Connection Status
- `isConnected`: Boolean indicating if the WebSocket is connected
- `readyState`: WebSocket ready state (CONNECTING, OPEN, CLOSING, CLOSED)
- `reconnectAttempts`: Number of reconnection attempts made

### Timing Information
- `connectionDuration`: Duration of current connection in milliseconds
- `lastActivity`: Timestamp of last message activity

### Error Handling
- `errorMessage`: Detailed error message if connection fails
- `onError`: Callback for error events
- `onStatusChange`: Callback for status changes

## Status Display Features

### Visual Indicators
- **Green dot**: Connected and stable
- **Orange pulsing dot**: Reconnecting
- **Red dot**: Disconnected or error
- **Animated indicators**: For reconnection attempts

### Status Text
- "Connected" - WebSocket is open and ready
- "Connecting..." - WebSocket is attempting to connect
- "Reconnecting (X)" - WebSocket is attempting to reconnect (X = attempt number)
- "Disconnected" - WebSocket is closed

### Detailed Information
- Connection duration in human-readable format
- Last activity timestamp
- Error messages with specific details
- Reconnection attempt progress

## Error Handling

### Common Issues and Solutions

1. **Connection refused**: Check if the WebSocket server is running
2. **Network timeout**: Verify network connectivity and server status
3. **Reconnection not working**: Check network connectivity and server status
4. **Message parsing errors**: Verify message format and JSON structure

### Error Recovery
- Automatic reconnection with exponential backoff
- Maximum reconnection attempts (default: 5)
- Configurable reconnection interval (default: 3000ms)
- Detailed error reporting for debugging

## Configuration Options

```tsx
const options = {
  url: 'ws://localhost:8080',           // WebSocket server URL
  reconnectInterval: 3000,              // Reconnection delay in ms
  maxReconnectAttempts: 5,              // Maximum reconnection attempts
  roomId: 'my-room',                    // Room ID for auto-subscription
  onMessage: (message) => {},           // Message handler
  onOpen: () => {},                     // Connection open handler
  onClose: () => {},                    // Connection close handler
  onError: (error) => {},               // Error handler
  onStatusChange: (status) => {},       // Status change handler
};
```

## Best Practices

1. **Always handle connection states**: Use the status indicators to inform users about connection health
2. **Implement error recovery**: Provide fallback behavior when WebSocket is disconnected
3. **Monitor connection duration**: Use connection duration to track system stability
4. **Display real-time status**: Keep users informed about connection status
5. **Handle reconnection gracefully**: Show reconnection progress to users

## Troubleshooting

### Connection Issues
- Verify WebSocket server is running
- Check network connectivity
- Ensure correct WebSocket URL
- Review browser console for errors

### Status Display Issues
- Verify all status props are being passed correctly
- Check CSS classes for proper styling
- Ensure StatusIndicator component is imported
- Review component hierarchy for prop drilling

### Performance Issues
- Monitor connection duration for long-running connections
- Check for memory leaks in status update intervals
- Verify cleanup functions are called on unmount
- Review reconnection logic for excessive attempts

## Examples

### Simple Status Display
```tsx
<StatusIndicator
  isConnected={isConnected}
  reconnectAttempts={reconnectAttempts}
/>
```

### Detailed Status Dashboard
```tsx
<StatusDashboard
  isConnected={isConnected}
  readyState={readyState}
  reconnectAttempts={reconnectAttempts}
  connectionDuration={connectionDuration}
  lastActivity={lastActivity}
  errorMessage={errorMessage}
/>
```

### Custom Status Styling
```tsx
<StatusIndicator
  isConnected={isConnected}
  className="custom-status-class"
  showDetails={false}
/>
```

This enhanced status system provides comprehensive monitoring and user feedback for WebSocket connections, making it easy to track connection health and troubleshoot issues in real-time. 