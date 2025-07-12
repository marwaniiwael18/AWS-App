const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const validator = require('validator');

// Configure AWS DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

// Popular skills data
const POPULAR_SKILLS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker',
  'Photography', 'Graphic Design', 'Digital Marketing', 'Writing',
  'Spanish', 'French', 'German', 'Mandarin', 'Japanese',
  'Guitar', 'Piano', 'Singing', 'Dancing', 'Yoga',
  'Cooking', 'Baking', 'Gardening', 'Painting', 'Drawing',
  'Public Speaking', 'Leadership', 'Project Management',
  'Data Analysis', 'Machine Learning', 'UI/UX Design',
  'Video Editing', 'Animation', '3D Modeling', 'Game Development'
];

class UserController {
  // Get user profile
  static async getUserProfile(req, res) {
    try {
      const userId = req.user.id;
      
      // In a real app, this would query DynamoDB
      const params = {
        TableName: 'Users',
        Key: { id: userId }
      };
      
      // Mock response for development
      const mockProfile = {
        id: userId,
        name: req.user.name || 'John Doe',
        email: req.user.email || 'john@example.com',
        bio: 'Passionate about learning and sharing knowledge.',
        skillsOffered: ['JavaScript', 'React', 'Photography'],
        skillsWanted: ['Python', 'Spanish', 'Guitar'],
        location: 'San Francisco, CA',
        rating: 4.8,
        totalRatings: 24,
        joinedAt: new Date().toISOString(),
        preferences: {
          notifications: true,
          visibility: 'public',
          maxDistance: 50
        }
      };
      
      res.json({
        success: true,
        data: mockProfile,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get user profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user profile',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Update user profile
  static async updateUserProfile(req, res) {
    try {
      const userId = req.user.id;
      const { name, bio, location, skillsOffered, skillsWanted } = req.body;
      
      // Validate input
      if (name && !validator.isLength(name, { min: 2, max: 50 })) {
        return res.status(400).json({
          success: false,
          error: 'Name must be between 2 and 50 characters',
          timestamp: new Date().toISOString()
        });
      }
      
      if (bio && !validator.isLength(bio, { max: 500 })) {
        return res.status(400).json({
          success: false,
          error: 'Bio must be less than 500 characters',
          timestamp: new Date().toISOString()
        });
      }
      
      if (skillsOffered && !Array.isArray(skillsOffered)) {
        return res.status(400).json({
          success: false,
          error: 'Skills offered must be an array',
          timestamp: new Date().toISOString()
        });
      }
      
      if (skillsWanted && !Array.isArray(skillsWanted)) {
        return res.status(400).json({
          success: false,
          error: 'Skills wanted must be an array',
          timestamp: new Date().toISOString()
        });
      }
      
      // In a real app, this would update DynamoDB
      const updatedProfile = {
        id: userId,
        name: name || req.user.name,
        email: req.user.email,
        bio: bio || 'Passionate about learning and sharing knowledge.',
        skillsOffered: skillsOffered || ['JavaScript', 'React', 'Photography'],
        skillsWanted: skillsWanted || ['Python', 'Spanish', 'Guitar'],
        location: location || 'San Francisco, CA',
        rating: 4.8,
        totalRatings: 24,
        updatedAt: new Date().toISOString()
      };
      
      res.json({
        success: true,
        data: updatedProfile,
        message: 'Profile updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Update user profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user profile',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Delete user profile
  static async deleteUserProfile(req, res) {
    try {
      const userId = req.user.id;
      
      // In a real app, this would delete from DynamoDB
      console.log(`Deleting user profile: ${userId}`);
      
      res.json({
        success: true,
        message: 'User profile deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Delete user profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete user profile',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Search users
  static async searchUsers(req, res) {
    try {
      const { q, skills, location, rating, limit = 10, offset = 0 } = req.query;
      
      // Mock search results
      const mockUsers = [
        {
          id: 'user-1',
          name: 'Sarah Johnson',
          bio: 'Frontend developer and language enthusiast',
          skillsOffered: ['Python', 'Spanish', 'Photography'],
          skillsWanted: ['JavaScript', 'React', 'Guitar'],
          location: 'San Francisco, CA',
          rating: 4.9,
          distance: '2.3 miles',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b167?w=150&h=150&fit=crop&crop=face'
        },
        {
          id: 'user-2',
          name: 'Carlos Rodriguez',
          bio: 'Musician and web developer',
          skillsOffered: ['Guitar', 'Node.js', 'Spanish'],
          skillsWanted: ['React', 'Photography', 'Python'],
          location: 'Oakland, CA',
          rating: 4.7,
          distance: '8.1 miles',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        }
      ];
      
      // Filter based on search criteria
      let filteredUsers = mockUsers;
      
      if (q) {
        filteredUsers = filteredUsers.filter(user =>
          user.name.toLowerCase().includes(q.toLowerCase()) ||
          user.bio.toLowerCase().includes(q.toLowerCase())
        );
      }
      
      if (skills) {
        const skillsArray = Array.isArray(skills) ? skills : [skills];
        filteredUsers = filteredUsers.filter(user =>
          skillsArray.some(skill =>
            user.skillsOffered.includes(skill) || user.skillsWanted.includes(skill)
          )
        );
      }
      
      if (rating) {
        filteredUsers = filteredUsers.filter(user => user.rating >= parseFloat(rating));
      }
      
      // Pagination
      const startIndex = parseInt(offset);
      const endIndex = startIndex + parseInt(limit);
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
      
      res.json({
        success: true,
        data: paginatedUsers,
        pagination: {
          total: filteredUsers.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: endIndex < filteredUsers.length
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search users',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Get popular skills
  static async getPopularSkills(req, res) {
    try {
      const { category, limit = 20 } = req.query;
      
      let skills = POPULAR_SKILLS;
      
      // Filter by category if specified
      if (category) {
        // In a real app, skills would be categorized
        skills = skills.filter(skill => {
          // Mock category filtering
          return true;
        });
      }
      
      const limitedSkills = skills.slice(0, parseInt(limit));
      
      res.json({
        success: true,
        data: limitedSkills,
        total: skills.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get popular skills error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch popular skills',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Get user skills
  static async getUserSkills(req, res) {
    try {
      const userId = req.user.id;
      
      // Mock user skills
      const mockSkills = {
        offered: [
          { id: 'skill-1', name: 'JavaScript', level: 'Expert', yearsExperience: 5 },
          { id: 'skill-2', name: 'React', level: 'Advanced', yearsExperience: 3 },
          { id: 'skill-3', name: 'Photography', level: 'Intermediate', yearsExperience: 2 }
        ],
        wanted: [
          { id: 'skill-4', name: 'Python', level: 'Beginner', priority: 'High' },
          { id: 'skill-5', name: 'Spanish', level: 'Beginner', priority: 'Medium' },
          { id: 'skill-6', name: 'Guitar', level: 'Beginner', priority: 'Low' }
        ]
      };
      
      res.json({
        success: true,
        data: mockSkills,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get user skills error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user skills',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Add user skill
  static async addSkill(req, res) {
    try {
      const userId = req.user.id;
      const { name, type, level, yearsExperience, priority } = req.body;
      
      // Validate input
      if (!name || !type) {
        return res.status(400).json({
          success: false,
          error: 'Skill name and type are required',
          timestamp: new Date().toISOString()
        });
      }
      
      if (!['offered', 'wanted'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Skill type must be either "offered" or "wanted"',
          timestamp: new Date().toISOString()
        });
      }
      
      // Mock skill creation
      const newSkill = {
        id: uuidv4(),
        name,
        type,
        level: level || 'Beginner',
        yearsExperience: yearsExperience || 0,
        priority: priority || 'Medium',
        createdAt: new Date().toISOString()
      };
      
      res.status(201).json({
        success: true,
        data: newSkill,
        message: 'Skill added successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Add skill error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add skill',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Remove user skill
  static async removeSkill(req, res) {
    try {
      const userId = req.user.id;
      const { skillId } = req.params;
      
      // Mock skill removal
      console.log(`Removing skill ${skillId} for user ${userId}`);
      
      res.json({
        success: true,
        message: 'Skill removed successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Remove skill error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove skill',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Get user preferences
  static async getUserPreferences(req, res) {
    try {
      const userId = req.user.id;
      
      // Mock preferences
      const mockPreferences = {
        notifications: {
          email: true,
          push: false,
          matches: true,
          messages: true
        },
        privacy: {
          profileVisibility: 'public',
          showEmail: false,
          showLocation: true
        },
        matching: {
          maxDistance: 50,
          ageRange: { min: 18, max: 65 },
          preferredLanguages: ['English', 'Spanish']
        }
      };
      
      res.json({
        success: true,
        data: mockPreferences,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get user preferences error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user preferences',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Update user preferences
  static async updateUserPreferences(req, res) {
    try {
      const userId = req.user.id;
      const preferences = req.body;
      
      // Mock preference update
      console.log(`Updating preferences for user ${userId}:`, preferences);
      
      res.json({
        success: true,
        data: preferences,
        message: 'Preferences updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Update user preferences error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user preferences',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Get user statistics
  static async getUserStats(req, res) {
    try {
      const userId = req.user.id;
      
      // Mock statistics
      const mockStats = {
        totalMatches: 15,
        activeConversations: 3,
        skillsOffered: 3,
        skillsWanted: 3,
        rating: 4.8,
        totalRatings: 24,
        joinedDaysAgo: 45,
        lastActive: new Date().toISOString()
      };
      
      res.json({
        success: true,
        data: mockStats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user statistics',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Get user ratings
  static async getUserRatings(req, res) {
    try {
      const userId = req.user.id;
      
      // Mock ratings
      const mockRatings = [
        {
          id: 'rating-1',
          fromUser: { id: 'user-1', name: 'Sarah Johnson' },
          rating: 5,
          comment: 'Great teacher! Very patient and knowledgeable.',
          skill: 'JavaScript',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'rating-2',
          fromUser: { id: 'user-2', name: 'Carlos Rodriguez' },
          rating: 4,
          comment: 'Good photography tips and techniques.',
          skill: 'Photography',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      res.json({
        success: true,
        data: mockRatings,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get user ratings error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user ratings',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Rate user
  static async rateUser(req, res) {
    try {
      const userId = req.user.id;
      const { userId: targetUserId } = req.params;
      const { rating, comment, skill } = req.body;
      
      // Validate input
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5',
          timestamp: new Date().toISOString()
        });
      }
      
      if (userId === targetUserId) {
        return res.status(400).json({
          success: false,
          error: 'Cannot rate yourself',
          timestamp: new Date().toISOString()
        });
      }
      
      // Mock rating creation
      const newRating = {
        id: uuidv4(),
        fromUserId: userId,
        toUserId: targetUserId,
        rating,
        comment,
        skill,
        createdAt: new Date().toISOString()
      };
      
      res.status(201).json({
        success: true,
        data: newRating,
        message: 'Rating submitted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Rate user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit rating',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Block user
  static async blockUser(req, res) {
    try {
      const userId = req.user.id;
      const { userId: targetUserId } = req.params;
      
      if (userId === targetUserId) {
        return res.status(400).json({
          success: false,
          error: 'Cannot block yourself',
          timestamp: new Date().toISOString()
        });
      }
      
      // Mock user blocking
      console.log(`User ${userId} blocked user ${targetUserId}`);
      
      res.json({
        success: true,
        message: 'User blocked successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Block user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to block user',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Report user
  static async reportUser(req, res) {
    try {
      const userId = req.user.id;
      const { userId: targetUserId } = req.params;
      const { reason, description } = req.body;
      
      if (userId === targetUserId) {
        return res.status(400).json({
          success: false,
          error: 'Cannot report yourself',
          timestamp: new Date().toISOString()
        });
      }
      
      if (!reason) {
        return res.status(400).json({
          success: false,
          error: 'Reason is required',
          timestamp: new Date().toISOString()
        });
      }
      
      // Mock user reporting
      const report = {
        id: uuidv4(),
        fromUserId: userId,
        toUserId: targetUserId,
        reason,
        description,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      console.log('User report created:', report);
      
      res.status(201).json({
        success: true,
        data: report,
        message: 'User reported successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Report user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to report user',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Get user activity
  static async getUserActivity(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 10, offset = 0 } = req.query;
      
      // Mock activity data
      const mockActivities = [
        {
          id: 'activity-1',
          type: 'match_request',
          description: 'Sent match request to Sarah Johnson',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'activity-2',
          type: 'skill_added',
          description: 'Added skill: Photography',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'activity-3',
          type: 'profile_updated',
          description: 'Updated profile bio',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      // Pagination
      const startIndex = parseInt(offset);
      const endIndex = startIndex + parseInt(limit);
      const paginatedActivities = mockActivities.slice(startIndex, endIndex);
      
      res.json({
        success: true,
        data: paginatedActivities,
        pagination: {
          total: mockActivities.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: endIndex < mockActivities.length
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get user activity error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user activity',
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = UserController; 