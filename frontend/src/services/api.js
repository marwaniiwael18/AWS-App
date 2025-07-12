import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service object
const apiService = {
  // User management
  users: {
    // Get current user profile
    getCurrentUser: async () => {
      const response = await api.get('/users/me');
      return response.data;
    },

    // Get user by ID
    getUserById: async (userId) => {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    },

    // Update user profile
    updateUser: async (userId, userData) => {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data;
    },

    // Get user statistics
    getUserStats: async (userId) => {
      const response = await api.get(`/users/${userId}/stats`);
      return response.data;
    },

    // Search users
    searchUsers: async (params) => {
      const response = await api.get('/users', { params });
      return response.data;
    },

    // Search users by skills
    searchUsersBySkills: async (skills, excludeUserId = null) => {
      const params = {
        skills: Array.isArray(skills) ? skills : [skills],
      };
      if (excludeUserId) {
        params.excludeUserId = excludeUserId;
      }
      const response = await api.get('/users/search/skills', { params });
      return response.data;
    },

    // Search users by location
    searchUsersByLocation: async (location, limit = 50) => {
      const response = await api.get('/users/search/location', {
        params: { location, limit },
      });
      return response.data;
    },

    // Delete user
    deleteUser: async (userId) => {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    },
  },

  // Skills management
  skills: {
    // Add skill to user
    addSkill: async (userId, skill, type = 'offered') => {
      const response = await api.post(`/users/${userId}/skills`, { skill, type });
      return response.data;
    },

    // Remove skill from user
    removeSkill: async (userId, skill, type = 'offered') => {
      const response = await api.delete(`/users/${userId}/skills`, {
        data: { skill, type },
      });
      return response.data;
    },
  },

  // Matching system
  matches: {
    // Get potential matches for user
    getPotentialMatches: async (userId, limit = 20) => {
      const response = await api.get(`/users/${userId}/matches`, {
        params: { limit },
      });
      return response.data;
    },

    // Create match request
    createMatchRequest: async (matchData) => {
      const response = await api.post('/matches', matchData);
      return response.data;
    },

    // Get user's matches
    getUserMatches: async (userId) => {
      const response = await api.get(`/matches/user/${userId}`);
      return response.data;
    },

    // Respond to match request
    respondToMatch: async (matchId, response) => {
      const result = await api.put(`/matches/${matchId}/respond`, { response });
      return result.data;
    },

    // Get match details
    getMatchDetails: async (matchId) => {
      const response = await api.get(`/matches/${matchId}`);
      return response.data;
    },
  },

  // Rating system
  ratings: {
    // Rate a user
    rateUser: async (userId, rating, comment = '') => {
      const response = await api.put(`/users/${userId}/rating`, { rating, comment });
      return response.data;
    },

    // Get user ratings
    getUserRatings: async (userId) => {
      const response = await api.get(`/users/${userId}/ratings`);
      return response.data;
    },
  },

  // Messages/Chat
  messages: {
    // Get conversation messages
    getMessages: async (conversationId, limit = 50, offset = 0) => {
      const response = await api.get(`/messages/${conversationId}`, {
        params: { limit, offset },
      });
      return response.data;
    },

    // Send message
    sendMessage: async (messageData) => {
      const response = await api.post('/messages', messageData);
      return response.data;
    },

    // Get user conversations
    getConversations: async (userId) => {
      const response = await api.get(`/messages/conversations/${userId}`);
      return response.data;
    },

    // Mark messages as read
    markAsRead: async (conversationId, userId) => {
      const response = await api.put(`/messages/${conversationId}/read`, { userId });
      return response.data;
    },
  },

  // Health check
  health: {
    check: async () => {
      const response = await api.get('/health');
      return response.data;
    },
  },
};

// Helper functions for common operations
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || 'An error occurred';
    return {
      success: false,
      message,
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Network error
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      status: 0,
    };
  } else {
    // Other error
    return {
      success: false,
      message: 'An unexpected error occurred',
      status: 0,
    };
  }
};

// Authentication helpers
export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export default apiService; 