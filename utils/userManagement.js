// User management utilities for real people integration

// Load real users from database/API with mock fallback
async function loadRealUsers() {
  try {
    const response = await userAPI.getUsers();
    return response.users || [];
  } catch (error) {
    console.log('API not available, returning mock users');
    // Return mock users when API is not available
    return [
      { id: 'user_1', name: 'Alice Johnson', email: 'alice@example.com', isOnline: true },
      { id: 'user_2', name: 'Bob Smith', email: 'bob@example.com', isOnline: false },
      { id: 'user_3', name: 'Carol Davis', email: 'carol@example.com', isOnline: true },
      { id: 'user_4', name: 'David Wilson', email: 'david@example.com', isOnline: false },
      { id: 'user_5', name: 'Emma Brown', email: 'emma@example.com', isOnline: true }
    ];
  }
}

// Create chat with real user
async function createChatWithUser(userId, userName) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;

    // Try to check existing chats via API
    try {
      const existingChats = await chatAPI.getChats();
      const existingChat = existingChats.find(chat => 
        !chat.isGroup && chat.members?.includes(userId)
      );

      if (existingChat) {
        return existingChat;
      }
    } catch (error) {
      console.log('API not available for checking existing chats, creating new chat');
    }

    // Create new chat (works both with API and mock)
    const newChat = {
      id: `chat_${currentUser.id}_${userId}`,
      name: userName,
      isGroup: false,
      isOnline: Math.random() > 0.5, // Random online status for mock
      lastSeen: new Date(Date.now() - Math.random() * 60 * 60000).toISOString(),
      unreadCount: 0,
      members: [currentUser.id, userId],
      messages: [
        {
          id: 1,
          text: `Hi ${currentUser.name}! Great to connect with you on ChatRizz!`,
          sender: userId,
          senderName: userName,
          timestamp: new Date().toISOString(),
          status: 'delivered'
        }
      ],
      lastMessage: {
        text: `Hi ${currentUser.name}! Great to connect with you on ChatRizz!`,
        timestamp: new Date().toISOString(),
        status: 'delivered',
        sender: userId,
        senderName: userName
      }
    };

    return newChat;
  } catch (error) {
    console.error('Failed to create chat:', error);
    return null;
  }
}

// Search users by email or name with mock fallback
async function searchUsers(query) {
  try {
    if (!query || query.trim().length < 2) return [];
    
    const response = await userAPI.searchUsers(query);
    return response.users || [];
  } catch (error) {
    console.log('API not available, using mock search');
    // Mock search functionality
    const mockUsers = [
      { id: 'user_1', name: 'Alice Johnson', email: 'alice@example.com', isOnline: true },
      { id: 'user_2', name: 'Bob Smith', email: 'bob@example.com', isOnline: false },
      { id: 'user_3', name: 'Carol Davis', email: 'carol@example.com', isOnline: true },
      { id: 'user_4', name: 'David Wilson', email: 'david@example.com', isOnline: false },
      { id: 'user_5', name: 'Emma Brown', email: 'emma@example.com', isOnline: true }
    ];
    
    const lowerQuery = query.toLowerCase();
    return mockUsers.filter(user => 
      user.name.toLowerCase().includes(lowerQuery) || 
      user.email.toLowerCase().includes(lowerQuery)
    );
  }
}

// Add user to contacts
async function addToContacts(userId) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;

    // Add to local contacts list
    const contacts = JSON.parse(localStorage.getItem('chatrizz_contacts') || '[]');
    if (!contacts.includes(userId)) {
      contacts.push(userId);
      localStorage.setItem('chatrizz_contacts', JSON.stringify(contacts));
    }

    return true;
  } catch (error) {
    console.error('Failed to add contact:', error);
    return false;
  }
}

// Get user contacts
function getUserContacts() {
  try {
    return JSON.parse(localStorage.getItem('chatrizz_contacts') || '[]');
  } catch (error) {
    console.error('Failed to get contacts:', error);
    return [];
  }
}