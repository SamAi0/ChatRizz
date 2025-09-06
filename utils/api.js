// API utilities for ChatRizz backend communication

const API_BASE_URL = window.CHATRIZZ_CONFIG?.API_BASE_URL || '/api';

// Helper function to make authenticated API calls with fallback
async function apiCall(endpoint, options = {}) {
  try {
    const token = localStorage.getItem('chatrizz_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    // Check if response is HTML (backend not available)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      throw new Error('Backend not available - using mock data');
    }

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('chatrizz_token');
        localStorage.removeItem('chatrizz_user');
        window.location.href = 'auth.html';
        return;
      }
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.log('API not available, using mock data:', error.message);
    throw error;
  }
}

// Authentication API calls with mock fallback
const authAPI = {
  async login(email, password) {
    try {
      return await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    } catch (error) {
      throw error; // Let auth.js handle the fallback
    }
  },

  async register(name, email, password, preferredLanguage = 'en') {
    try {
      return await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, preferredLanguage })
      });
    } catch (error) {
      throw error; // Let auth.js handle the fallback
    }
  },

  async refreshToken() {
    try {
      return await apiCall('/auth/refresh', { method: 'POST' });
    } catch (error) {
      throw error;
    }
  }
};

// User API calls with mock fallback
const userAPI = {
  async getProfile() {
    try {
      return await apiCall('/users/profile');
    } catch (error) {
      const currentUser = getCurrentUser();
      return { user: currentUser };
    }
  },

  async updateProfile(profileData) {
    try {
      return await apiCall('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
    } catch (error) {
      // Mock update - just return updated data
      return { user: profileData };
    }
  },

  async getUsers() {
    try {
      return await apiCall('/users');
    } catch (error) {
      throw error; // Let userManagement.js handle the mock data
    }
  },

  async searchUsers(query) {
    try {
      return await apiCall(`/users/search?q=${encodeURIComponent(query)}`);
    } catch (error) {
      throw error; // Let userManagement.js handle the mock search
    }
  }
};

// Chat API calls with mock fallback
const chatAPI = {
  async getChats() {
    try {
      return await apiCall('/chats');
    } catch (error) {
      // Return mock chats from localStorage or default
      const savedChats = localStorage.getItem('chatrizz_mock_chats');
      if (savedChats) {
        return { chats: JSON.parse(savedChats) };
      }
      return { chats: [] };
    }
  },

  async getChatMessages(chatId, limit = 50, offset = 0) {
    try {
      return await apiCall(`/chats/${chatId}/messages?limit=${limit}&offset=${offset}`);
    } catch (error) {
      // Return empty messages for mock
      return { messages: [] };
    }
  },

  async sendMessage(chatId, text, language = 'en') {
    try {
      return await apiCall(`/chats/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text, language })
      });
    } catch (error) {
      // Mock message sending
      return {
        message: {
          id: Date.now(),
          text,
          sender: 'me',
          timestamp: new Date().toISOString(),
          status: 'sent'
        }
      };
    }
  },

  async markAsRead(chatId, messageId) {
    try {
      return await apiCall(`/chats/${chatId}/messages/${messageId}/read`, {
        method: 'POST'
      });
    } catch (error) {
      // Mock read confirmation
      return { success: true };
    }
  }
};

// Invitation API calls with mock fallback
const inviteAPI = {
  async sendInvitation(email, inviteLink) {
    try {
      return await apiCall('/invitations/send', {
        method: 'POST',
        body: JSON.stringify({ email, inviteLink })
      });
    } catch (error) {
      throw error; // Let InviteFriends.js handle the mock behavior
    }
  },

  async getUsersByEmail(emails) {
    try {
      return await apiCall('/users/search', {
        method: 'POST',
        body: JSON.stringify({ emails })
      });
    } catch (error) {
      return { users: [] }; // Return empty array for mock
    }
  }
};
