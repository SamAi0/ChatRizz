// WebSocket utilities for real-time communication

let socket = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

// Initialize WebSocket connection
function initializeSocket(user) {
  try {
    const token = localStorage.getItem('chatrizz_token');
    if (!token) return;

    const socketUrl = window.CHATRIZZ_CONFIG?.SOCKET_URL || window.location.origin;
    
    socket = io(socketUrl, {
      auth: {
        token: token
      },
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000
    });

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to server');
      reconnectAttempts = 0;
      
      // Join user's personal room
      socket.emit('join_user_room', user.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
    });

    // Message events
    socket.on('new_message', (message) => {
      // Dispatch custom event to update UI
      window.dispatchEvent(new CustomEvent('new_message', { detail: message }));
    });

    socket.on('message_status_update', (data) => {
      window.dispatchEvent(new CustomEvent('message_status_update', { detail: data }));
    });

    // User status events
    socket.on('user_status_change', (data) => {
      window.dispatchEvent(new CustomEvent('user_status_change', { detail: data }));
    });

    // Typing events
    socket.on('user_typing', (data) => {
      window.dispatchEvent(new CustomEvent('user_typing', { detail: data }));
    });

    socket.on('user_stop_typing', (data) => {
      window.dispatchEvent(new CustomEvent('user_stop_typing', { detail: data }));
    });

  } catch (error) {
    console.error('Socket initialization error:', error);
  }
}

// Emit events to server
function emitMessage(chatId, message) {
  if (socket?.connected) {
    socket.emit('send_message', { chatId, message });
  }
}

function emitTyping(chatId, isTyping) {
  if (socket?.connected) {
    socket.emit(isTyping ? 'start_typing' : 'stop_typing', { chatId });
  }
}

function joinChatRoom(chatId) {
  if (socket?.connected) {
    socket.emit('join_chat_room', chatId);
  }
}

function leaveChatRoom(chatId) {
  if (socket?.connected) {
    socket.emit('leave_chat_room', chatId);
  }
}

// Disconnect WebSocket
function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}