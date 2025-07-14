import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import apiService, { handleApiError } from '../services/api';

const SkillContext = createContext();

// Popular skills list for autocomplete - moved outside component to prevent recreation
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

// Custom hook for using SkillContext
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

  // Get user profile
  const getUserProfile = useCallback(async () => {
    if (!user) return;
    
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
      
      // Create a mock profile if user exists but no profile found
      if (user && errorData.status === 404) {
        const mockProfile = {
          id: user.userId || 'mock-id',
          name: user.name || user.attributes?.name || 'User',
          email: user.email || user.attributes?.email || '',
          bio: '',
          location: '',
          skillsOffered: [],
          skillsWanted: [],
          profilePhoto: null,
          rating: 0,
          totalRatings: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setUserProfile(mockProfile);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update user profile
  const updateUserProfile = useCallback(async (profileData) => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.users.updateUser(profileData);
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
  }, [user]);

  // Upload profile photo
  const uploadProfilePhoto = useCallback(async (file) => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.users.uploadProfilePhoto(file);
      if (response.success) {
        // Update the user profile with the new photo URL
        setUserProfile(prev => ({
          ...prev,
          profilePhoto: response.data.profilePhoto
        }));
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to upload photo');
      }
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
      console.error('Error uploading profile photo:', errorData);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Delete profile photo
  const deleteProfilePhoto = useCallback(async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.users.deleteProfilePhoto();
      if (response.success) {
        // Remove the photo from user profile
        setUserProfile(prev => ({
          ...prev,
          profilePhoto: null
        }));
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to delete photo');
      }
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
      console.error('Error deleting profile photo:', errorData);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Find potential matches based on skills
  const findMatches = useCallback(async () => {
    if (!user?.userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.matches.getPotential();
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
  }, [user]);

  // Get user matches
  const getUserMatches = useCallback(async () => {
    if (!user?.userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.matches.getAll();
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
  }, [user]);

  // Send match request
  const sendMatchRequest = useCallback(async (targetUserId, message = '') => {
    if (!user?.userId) {
      throw new Error('User not authenticated');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.matches.send(targetUserId, message);
      if (response.success) {
        // Refresh matches
        getUserMatches();
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
  }, [user, getUserMatches]);

  // Respond to match request
  const respondToMatch = useCallback(async (matchId, response) => {
    if (!user?.userId) {
      throw new Error('User not authenticated');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiService.matches.respond(matchId, response);
      if (result.success) {
        // Refresh matches
        getUserMatches();
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
  }, [user, getUserMatches]);

  // Add skill to user profile
  const addSkill = useCallback(async (skill, type = 'offered') => {
    if (!user?.userId) {
      throw new Error('User not authenticated');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.users.addSkill(skill, type);
      if (response.success) {
        // Update local profile
        setUserProfile(prev => ({
          ...prev,
          [type === 'offered' ? 'skillsOffered' : 'skillsWanted']: [
            ...(prev[type === 'offered' ? 'skillsOffered' : 'skillsWanted'] || []),
            skill
          ]
        }));
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
  }, [user]);

  // Remove skill from user profile
  const removeSkill = useCallback(async (skill, type = 'offered') => {
    if (!user?.userId) {
      throw new Error('User not authenticated');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.users.removeSkill(skill, type);
      if (response.success) {
        // Update local profile
        setUserProfile(prev => ({
          ...prev,
          [type === 'offered' ? 'skillsOffered' : 'skillsWanted']: 
            (prev[type === 'offered' ? 'skillsOffered' : 'skillsWanted'] || [])
              .filter(s => s !== skill)
        }));
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
  }, [user]);

  // Search users by skills
  const searchUsersBySkills = useCallback(async (skills, excludeUserId = null) => {
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
      console.error('Error searching users by skills:', errorData);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search users by location
  const searchUsersByLocation = useCallback(async (location, limit = 50) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.users.searchUsersByLocation(location, limit);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to search users');
      }
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
      console.error('Error searching users by location:', errorData);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Rate user
  const rateUser = useCallback(async (userId, rating, comment = '') => {
    if (!user?.userId) {
      throw new Error('User not authenticated');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.users.rateUser(userId, rating, comment);
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
  }, [user]);

  // Get user statistics
  const getUserStats = useCallback(async () => {
    if (!user?.userId) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.users.getUserStats();
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch user stats');
      }
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
      console.error('Error fetching user stats:', errorData);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load user profile when user changes
  useEffect(() => {
    if (user) {
      getUserProfile();
    } else {
      // Clear all user-related data when user is null
      setUserProfile(null);
      setMatches([]);
      setPotentialMatches([]);
      setError(null);
    }
  }, [user, getUserProfile]);

  const value = useMemo(() => ({
    userProfile,
    matches,
    potentialMatches,
    loading,
    error,
    popularSkills,
    
    // Profile functions
    getUserProfile,
    updateUserProfile,
    uploadProfilePhoto,
    deleteProfilePhoto,
    
    // Skills functions
    addSkill,
    removeSkill,
    
    // Matching functions
    findMatches,
    sendMatchRequest,
    respondToMatch,
    getUserMatches,
    
    // Search functions
    searchUsersBySkills,
    searchUsersByLocation,
    
    // Rating functions
    rateUser,
    getUserStats,
  }), [
    userProfile,
    matches,
    potentialMatches,
    loading,
    error,
    getUserProfile,
    updateUserProfile,
    uploadProfilePhoto,
    deleteProfilePhoto,
    addSkill,
    removeSkill,
    findMatches,
    sendMatchRequest,
    respondToMatch,
    getUserMatches,
    searchUsersBySkills,
    searchUsersByLocation,
    rateUser,
    getUserStats,
  ]);

  return (
    <SkillContext.Provider value={value}>
      {children}
    </SkillContext.Provider>
  );
}; 