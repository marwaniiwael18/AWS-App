const userService = require('../services/userService');
const { validationResult } = require('express-validator');

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
      const { userId } = req.params;
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

  // Get current user profile (from authenticated user)
  async getCurrentUser(req, res) {
    try {
      const userId = req.user.userId; // From JWT middleware
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
      console.error('Error in getCurrentUser:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get current user',
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

      const { userId } = req.params;
      const updates = req.body;
      
      // Check if user exists
      const existingUser = await userService.getUserById(userId);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
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

  // Get users by location
  async getUsersByLocation(req, res) {
    try {
      const { location } = req.query;
      const limit = parseInt(req.query.limit) || 50;
      
      if (!location) {
        return res.status(400).json({
          success: false,
          message: 'Location is required'
        });
      }

      const users = await userService.getUsersByLocation(location, limit);
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error in getUsersByLocation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users by location',
        error: error.message
      });
    }
  }

  // Search users by skills
  async searchUsersBySkills(req, res) {
    try {
      const { skills } = req.query;
      const excludeUserId = req.query.excludeUserId;
      
      if (!skills) {
        return res.status(400).json({
          success: false,
          message: 'Skills parameter is required'
        });
      }

      const skillsArray = Array.isArray(skills) ? skills : [skills];
      const users = await userService.searchUsersBySkills(skillsArray, excludeUserId);
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error in searchUsersBySkills:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search users by skills',
        error: error.message
      });
    }
  }

  // Add skill to user
  async addSkill(req, res) {
    try {
      const { userId } = req.params;
      const { skill, type = 'offered' } = req.body;
      
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
      const { userId } = req.params;
      const { skill, type = 'offered' } = req.body;
      
      if (!skill) {
        return res.status(400).json({
          success: false,
          message: 'Skill is required'
        });
      }

      const updatedUser = await userService.removeSkill(userId, skill, type);
      
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

  // Get potential matches for user
  async getPotentialMatches(req, res) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit) || 20;
      
      const matches = await userService.findPotentialMatches(userId, limit);
      
      res.json({
        success: true,
        data: matches
      });
    } catch (error) {
      console.error('Error in getPotentialMatches:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get potential matches',
        error: error.message
      });
    }
  }

  // Update user rating
  async updateUserRating(req, res) {
    try {
      const { userId } = req.params;
      const { rating } = req.body;
      
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      const updatedUser = await userService.updateUserRating(userId, rating);
      
      res.json({
        success: true,
        message: 'User rating updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Error in updateUserRating:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user rating',
        error: error.message
      });
    }
  }

  // Get all users (with pagination)
  async getAllUsers(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const lastEvaluatedKey = req.query.lastEvaluatedKey ? 
        JSON.parse(req.query.lastEvaluatedKey) : null;
      
      const result = await userService.getAllUsers(limit, lastEvaluatedKey);
      
      res.json({
        success: true,
        data: result.users,
        pagination: {
          lastEvaluatedKey: result.lastEvaluatedKey,
          hasMore: !!result.lastEvaluatedKey
        }
      });
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get all users',
        error: error.message
      });
    }
  }

  // Delete user
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;
      
      const user = await userService.deleteUser(userId);
      
      res.json({
        success: true,
        message: 'User deleted successfully',
        data: user
      });
    } catch (error) {
      console.error('Error in deleteUser:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error.message
      });
    }
  }

  // Get user statistics
  async getUserStats(req, res) {
    try {
      const { userId } = req.params;
      
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
}

module.exports = new UserController(); 