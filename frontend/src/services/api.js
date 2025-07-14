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
      // Redirect to home page instead of /login since we use modal authentication
      window.location.href = '/';
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
      const response = await api.get('/users/profile');
      return response.data;
    },

    // Get user by ID
    getUserById: async (userId) => {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    },

    // Update user profile
    updateUser: async (userData) => {
      const response = await api.put('/users/profile', userData);
      return response.data;
    },

    // Upload profile photo
    uploadProfilePhoto: async (file) => {
      const formData = new FormData();
      formData.append('profilePhoto', file);
      
      const response = await api.post('/users/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },

    // Delete profile photo
    deleteProfilePhoto: async () => {
      const response = await api.delete('/users/profile/photo');
      return response.data;
    },

    // Get user statistics
    getUserStats: async () => {
      const response = await api.get('/users/stats');
      return response.data;
    },

    // Search users
    searchUsers: async (params) => {
      const response = await api.get('/users/search', { params });
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
    deleteUser: async () => {
      const response = await api.delete('/users/profile');
      return response.data;
    },

    // Get popular skills
    getPopularSkills: async () => {
      const response = await api.get('/users/skills/popular');
      return response.data;
    },

    // Add skill
    addSkill: async (skill, type = 'offered') => {
      const response = await api.post('/users/skills', { skill, type });
      return response.data;
    },

    // Remove skill
    removeSkill: async (skillId, type = 'offered') => {
      const response = await api.delete(`/users/skills/${skillId}`, {
        data: { type }
      });
      return response.data;
    },

    // Rate user
    rateUser: async (userId, rating, comment = '') => {
      const response = await api.post(`/users/ratings/${userId}`, {
        rating,
        comment,
      });
      return response.data;
    },

    // Get user ratings
    getUserRatings: async () => {
      const response = await api.get('/users/ratings');
      return response.data;
    },

    // Block user
    blockUser: async (userId) => {
      const response = await api.post(`/users/block/${userId}`);
      return response.data;
    },

    // Report user
    reportUser: async (userId, reason, description = '') => {
      const response = await api.post(`/users/report/${userId}`, {
        reason,
        description,
      });
      return response.data;
    },

    // Get user activity
    getUserActivity: async () => {
      const response = await api.get('/users/activity');
      return response.data;
    },
  },

  // Skills management
  skills: {
    // Get all skills
    getAll: async () => {
      const response = await api.get('/skills');
      return response.data;
    },

    // Get popular skills
    getPopular: async () => {
      const response = await api.get('/skills/popular');
      return response.data;
    },

    // Create skill
    create: async (skillData) => {
      const response = await api.post('/skills', skillData);
      return response.data;
    },

    // Update skill
    update: async (skillId, skillData) => {
      const response = await api.put(`/skills/${skillId}`, skillData);
      return response.data;
    },

    // Delete skill
    delete: async (skillId) => {
      const response = await api.delete(`/skills/${skillId}`);
      return response.data;
    },
  },

  // Matches management
  matches: {
    // Get user matches
    getAll: async () => {
      const response = await api.get('/matches');
      return response.data;
    },

    // Send match request
    send: async (targetUserId, message = '') => {
      const response = await api.post('/matches', {
        targetUserId,
        message,
      });
      return response.data;
    },

    // Respond to match
    respond: async (matchId, response) => {
      const res = await api.put(`/matches/${matchId}`, { response });
      return res.data;
    },

    // Get potential matches
    getPotential: async () => {
      const response = await api.get('/matches/potential');
      return response.data;
    },
  },

  // Messages management
  messages: {
    // Get conversations
    getConversations: async () => {
      const response = await api.get('/messages/conversations');
      return response.data;
    },

    // Get messages for a conversation
    getMessages: async (conversationId) => {
      const response = await api.get(`/messages/${conversationId}`);
      return response.data;
    },

    // Send message
    send: async (conversationId, content) => {
      const response = await api.post(`/messages/${conversationId}`, {
        content,
      });
      return response.data;
    },
  },
};

// Error handling utility
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    return {
      status,
      message: data.message || data.error || 'An error occurred',
      details: data.details || null,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      status: 0,
      message: 'Network error. Please check your connection.',
      details: null,
    };
  } else {
    // Something else happened
    return {
      status: 0,
      message: error.message || 'An unexpected error occurred',
      details: null,
    };
  }
};

// Auth token utilities
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export default apiService; 