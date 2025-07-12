import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import apiService, { handleApiError } from '../services/api';

const SkillContext = createContext();

export const useSkill = () => {
  const context = useContext(SkillContext);
  if (!context) {
    throw new Error('useSkill must be used within a SkillProvider');
  }
  return context;
};

export const SkillProvider = ({ children }) => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Popular skills list for autocomplete
  const popularSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker',
    'Photography', 'Graphic Design', 'Digital Marketing', 'Writing',
    'Spanish', 'French', 'German', 'Mandarin', 'Japanese',
    'Guitar', 'Piano', 'Singing', 'Dancing', 'Yoga',
    'Cooking', 'Baking', 'Gardening', 'Painting', 'Drawing',
    'Public Speaking', 'Leadership', 'Project Management',
    'Data Analysis', 'Machine Learning', 'UI/UX Design',
    'Video Editing', 'Animation', '3D Modeling', 'Game Development'
  ];

  // Get user profile
  const getUserProfile = async () => {
    if (!user?.userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.users.getCurrentUser();
      if (response.success) {
        setUserProfile(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch user profile');
      }
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
      console.error('Error fetching user profile:', errorData);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    if (!user?.userId) {
      throw new Error('User not authenticated');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.users.updateUser(user.userId, profileData);
      if (response.success) {
        setUserProfile(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
      console.error('Error updating user profile:', errorData);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Find potential matches based on skills
  const findMatches = async () => {
    if (!user?.userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.matches.getPotentialMatches(user.userId);
      if (response.success) {
        setPotentialMatches(response.data);
      } else {
        throw new Error(response.message || 'Failed to find matches');
      }
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
      console.error('Error finding matches:', errorData);
    } finally {
      setLoading(false);
    }
  };

  // Send match request
  const sendMatchRequest = async (targetUserId, message = '') => {
    if (!user?.userId) {
      throw new Error('User not authenticated');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const matchData = {
        userId1: user.userId,
        userId2: targetUserId,
        message,
        status: 'pending'
      };
      
      const response = await apiService.matches.createMatchRequest(matchData);
      if (response.success) {
        setMatches(prev => [...prev, response.data]);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to send match request');
      }
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
      console.error('Error sending match request:', errorData);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Accept/decline match request
  const respondToMatch = async (matchId, response) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiService.matches.respondToMatch(matchId, response);
      if (result.success) {
        setMatches(prev => prev.map(match => 
          match.id === matchId 
            ? { ...match, status: response }
            : match
        ));
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to respond to match');
      }
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
      console.error('Error responding to match:', errorData);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get user matches
  const getUserMatches = async () => {
    if (!user?.userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.matches.getUserMatches(user.userId);
      if (response.success) {
        setMatches(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch matches');
      }
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
      console.error('Error fetching matches:', errorData);
    } finally {
      setLoading(false);
    }
  };

  // Add skill to user
  const addSkill = async (skill, type = 'offered') => {
    if (!user?.userId) {
      throw new Error('User not authenticated');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.skills.addSkill(user.userId, skill, type);
      if (response.success) {
        setUserProfile(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to add skill');
      }
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
      console.error('Error adding skill:', errorData);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove skill from user
  const removeSkill = async (skill, type = 'offered') => {
    if (!user?.userId) {
      throw new Error('User not authenticated');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.skills.removeSkill(user.userId, skill, type);
      if (response.success) {
        setUserProfile(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to remove skill');
      }
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
      console.error('Error removing skill:', errorData);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Search users by skills
  const searchUsersBySkills = async (skills, excludeUserId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.users.searchUsersBySkills(skills, excludeUserId);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to search users');
      }
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
      console.error('Error searching users:', errorData);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Search users by location
  const searchUsersByLocation = async (location, limit = 50) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.users.searchUsersByLocation(location, limit);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to search users by location');
      }
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
      console.error('Error searching users by location:', errorData);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Rate a user
  const rateUser = async (userId, rating, comment = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.ratings.rateUser(userId, rating, comment);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to rate user');
      }
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
      console.error('Error rating user:', errorData);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get user statistics
  const getUserStats = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.users.getUserStats(userId);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to get user stats');
      }
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
      console.error('Error getting user stats:', errorData);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load user profile when user changes
  useEffect(() => {
    if (user?.userId) {
      getUserProfile();
      getUserMatches();
    } else {
      setUserProfile(null);
      setMatches([]);
      setPotentialMatches([]);
    }
  }, [user?.userId]);

  // Auto-refresh matches when user profile changes
  useEffect(() => {
    if (userProfile?.skillsOffered?.length > 0 || userProfile?.skillsWanted?.length > 0) {
      findMatches();
    }
  }, [userProfile?.skillsOffered, userProfile?.skillsWanted]);

  const value = {
    // State
    userProfile,
    matches,
    potentialMatches,
    loading,
    error,
    popularSkills,
    
    // Methods
    getUserProfile,
    updateUserProfile,
    findMatches,
    sendMatchRequest,
    respondToMatch,
    getUserMatches,
    addSkill,
    removeSkill,
    searchUsersBySkills,
    searchUsersByLocation,
    rateUser,
    getUserStats,
    
    // Utility methods
    clearError: () => setError(null),
    refreshData: () => {
      if (user?.userId) {
        getUserProfile();
        getUserMatches();
        findMatches();
      }
    }
  };

  return (
    <SkillContext.Provider value={value}>
      {children}
    </SkillContext.Provider>
  );
};

export default SkillContext; 