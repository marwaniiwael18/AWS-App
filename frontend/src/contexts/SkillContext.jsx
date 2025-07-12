import { createContext, useContext, useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { useAuth } from './AuthContext';

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
    if (!user) return;
    
    try {
      setLoading(true);
      // This would be a GraphQL query to get user profile
      // const result = await API.graphql(graphqlOperation(getUser, { id: user.sub }));
      // setUserProfile(result.data.getUser);
      
      // Mock data for now
      const mockProfile = {
        id: user.sub,
        name: user.attributes?.name || 'John Doe',
        email: user.attributes?.email || 'john@example.com',
        bio: 'Passionate about learning and sharing knowledge.',
        skillsOffered: ['JavaScript', 'React', 'Photography'],
        skillsWanted: ['Python', 'Spanish', 'Guitar'],
        location: 'San Francisco, CA',
        rating: 4.8,
        totalRatings: 24,
        createdAt: new Date().toISOString(),
      };
      setUserProfile(mockProfile);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    try {
      setLoading(true);
      // This would be a GraphQL mutation to update user profile
      // const result = await API.graphql(graphqlOperation(updateUser, { input: profileData }));
      // setUserProfile(result.data.updateUser);
      
      // Mock update for now
      const updatedProfile = { ...userProfile, ...profileData };
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Find potential matches based on skills
  const findMatches = async () => {
    if (!userProfile) return;
    
    try {
      setLoading(true);
      // This would be a complex GraphQL query to find matches
      // const result = await API.graphql(graphqlOperation(findPotentialMatches, { 
      //   skillsWanted: userProfile.skillsWanted,
      //   skillsOffered: userProfile.skillsOffered,
      //   excludeUserId: userProfile.id
      // }));
      
      // Mock potential matches
      const mockMatches = [
        {
          id: 'match-1',
          user: {
            id: 'user-2',
            name: 'Sarah Johnson',
            bio: 'Frontend developer and language enthusiast',
            skillsOffered: ['Python', 'Spanish'],
            skillsWanted: ['JavaScript', 'Photography'],
            location: 'San Francisco, CA',
            rating: 4.9,
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b167?w=150&h=150&fit=crop&crop=face'
          },
          matchingSkills: ['Python', 'Spanish'],
          compatibility: 0.85,
          distance: '2.3 miles',
        },
        {
          id: 'match-2',
          user: {
            id: 'user-3',
            name: 'Carlos Rodriguez',
            bio: 'Musician and web developer',
            skillsOffered: ['Guitar', 'Node.js'],
            skillsWanted: ['React', 'Photography'],
            location: 'Oakland, CA',
            rating: 4.7,
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
          },
          matchingSkills: ['Guitar'],
          compatibility: 0.78,
          distance: '8.1 miles',
        },
      ];
      
      setPotentialMatches(mockMatches);
    } catch (err) {
      setError(err.message);
      console.error('Error finding matches:', err);
    } finally {
      setLoading(false);
    }
  };

  // Send match request
  const sendMatchRequest = async (matchId, message = '') => {
    try {
      setLoading(true);
      // This would be a GraphQL mutation to create a match request
      // const result = await API.graphql(graphqlOperation(createMatchRequest, {
      //   input: {
      //     userId1: userProfile.id,
      //     userId2: matchId,
      //     message,
      //     status: 'pending'
      //   }
      // }));
      
      // Mock match request
      const newMatch = {
        id: `match-${Date.now()}`,
        userId1: userProfile.id,
        userId2: matchId,
        message,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      setMatches(prev => [...prev, newMatch]);
      return newMatch;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Accept/decline match request
  const respondToMatch = async (matchId, response) => {
    try {
      setLoading(true);
      // This would be a GraphQL mutation to update match status
      // const result = await API.graphql(graphqlOperation(updateMatchRequest, {
      //   input: {
      //     id: matchId,
      //     status: response
      //   }
      // }));
      
      // Mock response
      setMatches(prev => prev.map(match => 
        match.id === matchId 
          ? { ...match, status: response }
          : match
      ));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get user's matches
  const getUserMatches = async () => {
    if (!userProfile) return;
    
    try {
      setLoading(true);
      // This would be a GraphQL query to get user's matches
      // const result = await API.graphql(graphqlOperation(listMatchesByUser, {
      //   userId: userProfile.id
      // }));
      
      // Mock matches
      const mockMatches = [
        {
          id: 'match-accepted-1',
          userId1: userProfile.id,
          userId2: 'user-2',
          skill: 'Python',
          status: 'accepted',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          otherUser: {
            id: 'user-2',
            name: 'Sarah Johnson',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b167?w=150&h=150&fit=crop&crop=face'
          }
        },
      ];
      
      setMatches(mockMatches);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load user profile when user changes
  useEffect(() => {
    if (user) {
      getUserProfile();
    } else {
      setUserProfile(null);
      setMatches([]);
      setPotentialMatches([]);
    }
  }, [user]);

  const value = {
    userProfile,
    matches,
    potentialMatches,
    loading,
    error,
    popularSkills,
    getUserProfile,
    updateUserProfile,
    findMatches,
    sendMatchRequest,
    respondToMatch,
    getUserMatches,
  };

  return (
    <SkillContext.Provider value={value}>
      {children}
    </SkillContext.Provider>
  );
}; 