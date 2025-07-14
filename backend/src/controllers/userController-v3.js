const userService = require('../services/userService-v3');
const s3Service = require('../services/s3Service');
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
      
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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
      
      // Remove sensitive information
      const { password, ...publicProfile } = user;
      
      res.json({
        success: true,
        data: publicProfile
      });
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user profile',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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
      
      // Don't allow updating certain fields directly
      delete updates.userId;
      delete updates.createdAt;
      delete updates.rating;
      delete updates.totalRatings;
      
      const updatedUser = await userService.updateUser(userId, updates);
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Remove sensitive information
      const { password, ...publicProfile } = updatedUser;
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: publicProfile
      });
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Upload profile photo (Enhanced with S3 support)
  async uploadProfilePhoto(req, res) {
    try {
      const { userId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Get current user to check for existing photo
      const currentUser = await userService.getUserById(userId);
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Delete existing profile photo if it exists
      if (currentUser.profilePhoto) {
        try {
          await s3Service.deleteProfilePhoto(userId, currentUser.profilePhoto);
        } catch (deleteError) {
          console.warn('Warning: Could not delete old profile photo:', deleteError.message);
        }
      }

      // Upload new profile photo using S3 service
      const uploadResult = await s3Service.uploadProfilePhoto(req.file, userId);
      
      // Update user profile with new photo URL
      const updatedUser = await userService.updateUser(userId, {
        profilePhoto: uploadResult.url
      });

      res.json({
        success: true,
        message: 'Profile photo uploaded successfully',
        data: {
          profilePhoto: uploadResult.url,
          uploadInfo: {
            fileName: uploadResult.fileName,
            size: uploadResult.size,
            contentType: uploadResult.contentType,
            storage: uploadResult.isLocal ? 'local' : 's3'
          }
        }
      });

    } catch (error) {
      console.error('Error in uploadProfilePhoto:', error);
      
      let statusCode = 500;
      let message = 'Failed to upload profile photo';
      
      if (error.message.includes('Invalid file type')) {
        statusCode = 400;
        message = error.message;
      } else if (error.message.includes('File too large')) {
        statusCode = 413;
        message = error.message;
      }
      
      res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? error.message : 'Upload failed'
      });
    }
  }

  // Delete profile photo (Enhanced with S3 support)
  async deleteProfilePhoto(req, res) {
    try {
      const { userId } = req.params;
      
      // Get current user
      const currentUser = await userService.getUserById(userId);
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!currentUser.profilePhoto) {
        return res.status(400).json({
          success: false,
          message: 'No profile photo to delete'
        });
      }

      // Delete the photo using S3 service
      await s3Service.deleteProfilePhoto(userId, currentUser.profilePhoto);
      
      // Update user profile to remove photo URL
      const updatedUser = await userService.updateUser(userId, {
        profilePhoto: null
      });

      res.json({
        success: true,
        message: 'Profile photo deleted successfully',
        data: {
          profilePhoto: null
        }
      });

    } catch (error) {
      console.error('Error in deleteProfilePhoto:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete profile photo',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Delete user profile
  async deleteUserProfile(req, res) {
    try {
      const { userId } = req.params;
      
      // Get user before deletion to clean up files
      const user = await userService.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Delete profile photo if exists
      if (user.profilePhoto) {
        try {
          await s3Service.deleteProfilePhoto(userId, user.profilePhoto);
        } catch (deleteError) {
          console.warn('Warning: Could not delete profile photo during user deletion:', deleteError.message);
        }
      }

      // Delete user from database
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
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Search users
  async searchUsers(req, res) {
    try {
      const { skills, location, limit = 50 } = req.query;
      let users = [];
      
      if (skills) {
        const skillsArray = Array.isArray(skills) ? skills : skills.split(',');
        users = await userService.searchUsersBySkills(skillsArray, req.user?.userId);
      } else if (location) {
        users = await userService.getUsersByLocation(location, parseInt(limit));
      } else {
        const result = await userService.getAllUsers(parseInt(limit));
        users = result.users;
      }
      
      // Remove sensitive information
      const publicUsers = users.map(({ password, ...publicUser }) => publicUser);
      
      res.json({
        success: true,
        data: publicUsers,
        count: publicUsers.length
      });
    } catch (error) {
      console.error('Error in searchUsers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search users',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get popular skills
  async getPopularSkills(req, res) {
    try {
      // This would typically come from analytics or be calculated
      const popularSkills = [
        'JavaScript', 'Python', 'React', 'Node.js', 'AWS',
        'Docker', 'Kubernetes', 'Machine Learning', 'Data Science',
        'UI/UX Design', 'Project Management', 'Digital Marketing'
      ];
      
      res.json({
        success: true,
        data: popularSkills
      });
    } catch (error) {
      console.error('Error in getPopularSkills:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get popular skills',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get user skills
  async getUserSkills(req, res) {
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
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.json({
        success: true,
        message: `Skill added to ${type} skills`,
        data: {
          skillsOffered: updatedUser.skillsOffered || [],
          skillsWanted: updatedUser.skillsWanted || []
        }
      });
    } catch (error) {
      console.error('Error in addSkill:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add skill',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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
      
      if (!['offered', 'wanted'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be either "offered" or "wanted"'
        });
      }
      
      const updatedUser = await userService.removeSkill(userId, skill, type);
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.json({
        success: true,
        message: `Skill removed from ${type} skills`,
        data: {
          skillsOffered: updatedUser.skillsOffered || [],
          skillsWanted: updatedUser.skillsWanted || []
        }
      });
    } catch (error) {
      console.error('Error in removeSkill:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove skill',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get user statistics
  async getUserStats(req, res) {
    try {
      const { userId } = req.params;
      const stats = await userService.getUserStats(userId);
      
      if (!stats) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error in getUserStats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get storage information
  async getStorageInfo(req, res) {
    try {
      const storageInfo = s3Service.getStorageInfo();
      
      res.json({
        success: true,
        data: {
          storage: storageInfo,
          message: storageInfo.type === 's3' 
            ? 'Using AWS S3 for file storage' 
            : 'Using local file storage (development mode)'
        }
      });
    } catch (error) {
      console.error('Error in getStorageInfo:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get storage information',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Generate pre-signed URL for file upload (S3 only)
  async generateUploadUrl(req, res) {
    try {
      const { userId } = req.params;
      const { fileName, contentType } = req.body;
      
      if (!s3Service.isUsingS3()) {
        return res.status(400).json({
          success: false,
          message: 'Pre-signed URLs are only available when using S3 storage'
        });
      }
      
      if (!fileName || !contentType) {
        return res.status(400).json({
          success: false,
          message: 'fileName and contentType are required'
        });
      }
      
      // Generate S3 key
      const s3Key = `profiles/${s3Service.generateFileName(fileName, userId, 'profile_')}`;
      
      // Generate pre-signed URL (valid for 10 minutes)
      const signedUrl = await s3Service.getSignedUrl(s3Key, 600);
      
      res.json({
        success: true,
        data: {
          uploadUrl: signedUrl,
          s3Key,
          expiresIn: 600
        }
      });
    } catch (error) {
      console.error('Error in generateUploadUrl:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate upload URL',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = new UserController(); 