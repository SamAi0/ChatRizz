// Configuration for ChatRizz frontend application
window.CHATRIZZ_CONFIG = {
  // API configuration
  API_BASE_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api' 
    : '/api',
  
  // WebSocket configuration  
  SOCKET_URL: window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : window.location.origin,
  
  // App information
  APP_NAME: 'ChatRizz',
  VERSION: '1.0.0',
  
  // Feature flags
  FEATURES: {
    TRANSLATION: true,
    FILE_UPLOAD: false,
    VIDEO_CALL: false,
    VOICE_MESSAGE: false
  },
  
  // UI configuration
  UI: {
    THEME: 'auto', // 'light', 'dark', or 'auto'
    SIDEBAR_WIDTH: '320px',
    MAX_MESSAGE_LENGTH: 2000,
    TYPING_INDICATOR_DELAY: 300
  },
  
  // Development mode detection
  DEV_MODE: window.location.hostname === 'localhost'
};

// Fallback for any remaining process references
if (typeof window !== 'undefined' && !window.process) {
  window.process = {
    env: {
      NODE_ENV: window.CHATRIZZ_CONFIG.DEV_MODE ? 'development' : 'production'
    }
  };
}