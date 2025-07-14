const userService = require('../services/userService');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs').promises;

class UserController {
  
  // Create a new user
  async createUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userData = req.body;
      const user = await userService.createUser(userData);
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (error) {
      console.error('Error in createUser:', error);
      
      if (error.code === 'ConditionalCheckFailedException') {
        return res.status(409).json({
          success: false,
          message: 'User already exists'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error.message
      });
    }
  }

  // Get user profile
  async getUserProfile(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const user = await userService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user profile',
        error: error.message
      });
    }
  }

  // Update user profile
  async updateUserProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user?.userId;
      const updates = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const updatedUser = await userService.updateUser(userId, updates);
      
      res.json({
        success: true,
        message: 'User profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user profile',
        error: error.message
      });
    }
  }

  // Upload profile photo
  async uploadProfilePhoto(req, res) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads', 'profiles');
      await fs.mkdir(uploadsDir, { recursive: true });

      // Generate unique filename
      const fileExtension = path.extname(req.file.originalname);
      const fileName = `${userId}_${Date.now()}${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);

      // Save file
      await fs.writeFile(filePath, req.file.buffer);

      // Generate URL for the file
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const profilePhotoUrl = `${baseUrl}/uploads/profiles/${fileName}`;

      // Update user profile with photo URL
      const updatedUser = await userService.updateUser(userId, {
        profilePhoto: profilePhotoUrl
      });

      res.json({
        success: true,
        message: 'Profile photo uploaded successfully',
        data: {
          profilePhoto: profilePhotoUrl,
          user: updatedUser
        }
      });
    } catch (error) {
      console.error('Error in uploadProfilePhoto:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload profile photo',
        error: error.message
      });
    }
  }

  // Delete profile photo
  async deleteProfilePhoto(req, res) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      // Get current user to find existing photo
      const user = await userService.getUserById(userId);
      
      if (user?.profilePhoto) {
        // Delete file from filesystem
        // Extract the file path from the full URL
        let filePath;
        if (user.profilePhoto.startsWith('http')) {
          // Extract path from full URL: http://localhost:3000/uploads/profiles/filename.ext -> uploads/profiles/filename.ext
          const urlPath = user.profilePhoto.split('/').slice(3).join('/');
          filePath = path.join(process.cwd(), urlPath);
        } else {
          // Handle relative paths
          filePath = path.join(process.cwd(), user.profilePhoto);
        }
        
        try {
          await fs.unlink(filePath);
        } catch (fileError) {
          console.warn('Could not delete file:', fileError.message);
        }
      }

      // Update user profile to remove photo URL
      const updatedUser = await userService.updateUser(userId, {
        profilePhoto: null
      });

      res.json({
        success: true,
        message: 'Profile photo deleted successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Error in deleteProfilePhoto:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete profile photo',
        error: error.message
      });
    }
  }

  // Delete user profile
  async deleteUserProfile(req, res) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      await userService.deleteUser(userId);
      
      res.json({
        success: true,
        message: 'User profile deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteUserProfile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user profile',
        error: error.message
      });
    }
  }

  // Search users
  async searchUsers(req, res) {
    try {
      const { q, skills, location, limit = 20 } = req.query;
      
      let users = [];
      
      if (skills) {
        const skillsArray = Array.isArray(skills) ? skills : [skills];
        users = await userService.searchUsersBySkills(skillsArray);
      } else if (location) {
        users = await userService.getUsersByLocation(location, parseInt(limit));
      } else if (q) {
        // General search by name or email
        users = await userService.searchUsers(q, parseInt(limit));
      } else {
        users = await userService.getAllUsers(parseInt(limit));
      }
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error in searchUsers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search users',
        error: error.message
      });
    }
  }

  // Get popular skills
  async getPopularSkills(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      
      // Mock popular skills for now
      const popularSkills = [
        { name: 'JavaScript', count: 150 },
        { name: 'Python', count: 120 },
        { name: 'React', count: 100 },
        { name: 'Node.js', count: 80 },
        { name: 'Design', count: 75 },
        { name: 'Marketing', count: 60 },
        { name: 'Photography', count: 45 },
        { name: 'Writing', count: 40 },
        { name: 'Music', count: 35 },
        { name: 'Cooking', count: 30 }
      ].slice(0, limit);
      
      res.json({
        success: true,
        data: popularSkills
      });
    } catch (error) {
      console.error('Error in getPopularSkills:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get popular skills',
        error: error.message
      });
    }
  }

  // Get user skills
  async getUserSkills(req, res) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const user = await userService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          skillsOffered: user.skillsOffered || [],
          skillsWanted: user.skillsWanted || []
        }
      });
    } catch (error) {
      console.error('Error in getUserSkills:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user skills',
        error: error.message
      });
    }
  }

  // Add skill to user
  async addSkill(req, res) {
    try {
      const userId = req.user?.userId;
      const { skill, type = 'offered' } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      if (!skill) {
        return res.status(400).json({
          success: false,
          message: 'Skill is required'
        });
      }

      if (!['offered', 'wanted'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be either "offered" or "wanted"'
        });
      }

      const updatedUser = await userService.addSkill(userId, skill, type);
      
      res.json({
        success: true,
        message: 'Skill added successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Error in addSkill:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add skill',
        error: error.message
      });
    }
  }

  // Remove skill from user
  async removeSkill(req, res) {
    try {
      const userId = req.user?.userId;
      const { skillId } = req.params;
      const { type = 'offered' } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      if (!skillId) {
        return res.status(400).json({
          success: false,
          message: 'Skill ID is required'
        });
      }

      const updatedUser = await userService.removeSkill(userId, skillId, type);
      
      res.json({
        success: true,
        message: 'Skill removed successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Error in removeSkill:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove skill',
        error: error.message
      });
    }
  }

  // Get user preferences
  async getUserPreferences(req, res) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const user = await userService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          preferences: user.preferences || {},
          notifications: user.notifications || {}
        }
      });
    } catch (error) {
      console.error('Error in getUserPreferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user preferences',
        error: error.message
      });
    }
  }

  // Update user preferences
  async updateUserPreferences(req, res) {
    try {
      const userId = req.user?.userId;
      const { preferences, notifications } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const updates = {};
      if (preferences) updates.preferences = preferences;
      if (notifications) updates.notifications = notifications;

      const updatedUser = await userService.updateUser(userId, updates);
      
      res.json({
        success: true,
        message: 'User preferences updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Error in updateUserPreferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user preferences',
        error: error.message
      });
    }
  }

  // Get user statistics
  async getUserStats(req, res) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const user = await userService.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const stats = {
        skillsOffered: user.skillsOffered?.length || 0,
        skillsWanted: user.skillsWanted?.length || 0,
        rating: user.rating || 0,
        totalRatings: user.totalRatings || 0,
        joinDate: user.createdAt,
        lastActive: user.updatedAt
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error in getUserStats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user stats',
        error: error.message
      });
    }
  }

  // Get user ratings
  async getUserRatings(req, res) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      // Mock ratings for now
      const ratings = [
        {
          id: '1',
          fromUserId: 'user2',
          fromUserName: 'John Doe',
          rating: 5,
          comment: 'Great teacher, very patient!',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          fromUserId: 'user3',
          fromUserName: 'Jane Smith',
          rating: 4,
          comment: 'Learned a lot about React.',
          createdAt: new Date().toISOString()
        }
      ];

      res.json({
        success: true,
        data: ratings
      });
    } catch (error) {
      console.error('Error in getUserRatings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user ratings',
        error: error.message
      });
    }
  }

  // Rate user
  async rateUser(req, res) {
    try {
      const { userId } = req.params;
      const raterId = req.user?.userId;
      const { rating, comment } = req.body;
      
      if (!raterId) {
        return res.status(400).json({
          success: false,
          message: 'Rater ID is required'
        });
      }

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      // Mock rating creation for now
      const newRating = {
        id: Date.now().toString(),
        fromUserId: raterId,
        toUserId: userId,
        rating: rating,
        comment: comment || '',
        createdAt: new Date().toISOString()
      };

      res.json({
        success: true,
        message: 'User rated successfully',
        data: newRating
      });
    } catch (error) {
      console.error('Error in rateUser:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to rate user',
        error: error.message
      });
    }
  }

  // Block user
  async blockUser(req, res) {
    try {
      const { userId } = req.params;
      const blockerId = req.user?.userId;
      
      if (!blockerId) {
        return res.status(400).json({
          success: false,
          message: 'Blocker ID is required'
        });
      }

      // Mock blocking for now
      res.json({
        success: true,
        message: 'User blocked successfully'
      });
    } catch (error) {
      console.error('Error in blockUser:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to block user',
        error: error.message
      });
    }
  }

  // Report user
  async reportUser(req, res) {
    try {
      const { userId } = req.params;
      const reporterId = req.user?.userId;
      const { reason, description } = req.body;
      
      if (!reporterId) {
        return res.status(400).json({
          success: false,
          message: 'Reporter ID is required'
        });
      }

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Reason is required'
        });
      }

      // Mock reporting for now
      res.json({
        success: true,
        message: 'User reported successfully'
      });
    } catch (error) {
      console.error('Error in reportUser:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to report user',
        error: error.message
      });
    }
  }

  // Get user activity
  async getUserActivity(req, res) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      // Mock activity for now
      const activity = [
        {
          id: '1',
          type: 'skill_exchange',
          description: 'Completed JavaScript lesson with John Doe',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'rating_received',
          description: 'Received 5-star rating from Jane Smith',
          createdAt: new Date().toISOString()
        }
      ];

      res.json({
        success: true,
        data: activity
      });
    } catch (error) {
      console.error('Error in getUserActivity:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user activity',
        error: error.message
      });
    }
  }
}

module.exports = new UserController(); 