// Authentication utilities for ChatRizz

// Get current user from localStorage
function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('chatrizz_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Login user
async function loginUser(email, password) {
  try {
    // Try API login first, fallback to mock if API not available
    try {
      const response = await authAPI.login(email, password);
      
      if (response.token && response.user) {
        localStorage.setItem('chatrizz_token', response.token);
        localStorage.setItem('chatrizz_user', JSON.stringify(response.user));
        return true;
      }
    } catch (apiError) {
      console.log('API not available, using mock authentication');
    }
    
    // Mock login validation (fallback)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUsers = [
      { id: '1', name: 'John Doe', email: 'john@example.com', password: 'password123', preferredLanguage: 'en' },
      { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', password: 'password123', preferredLanguage: 'en' }
    ];
    
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem('chatrizz_user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('chatrizz_token', 'mock-jwt-token');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

// Register new user
async function registerUser(name, email, password) {
  try {
    // Try API registration first, fallback to mock if API not available
    try {
      const response = await authAPI.register(name, email, password);
      
      if (response.token && response.user) {
        localStorage.setItem('chatrizz_token', response.token);
        localStorage.setItem('chatrizz_user', JSON.stringify(response.user));
        return true;
      }
    } catch (apiError) {
      console.log('API not available, using mock registration');
    }
    
    // Mock registration (fallback)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      preferredLanguage: 'en',
      bio: '',
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('chatrizz_user', JSON.stringify(newUser));
    localStorage.setItem('chatrizz_token', 'mock-jwt-token');
    return true;
  } catch (error) {
    console.error('Registration error:', error);
    return false;
  }
}

// Update user profile
async function updateUserProfile(profileData) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) throw new Error('No user logged in');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedUser = {
      ...currentUser,
      ...profileData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('chatrizz_user', JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
}

// Logout user
function logoutUser() {
  try {
    localStorage.removeItem('chatrizz_user');
    localStorage.removeItem('chatrizz_token');
    disconnectSocket();
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}
