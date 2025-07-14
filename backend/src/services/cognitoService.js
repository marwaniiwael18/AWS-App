/**
 * AWS Cognito Service for SkillSwap
 * User management operations using AWS SDK v3
 */

const { 
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminSetUserPasswordCommand,
  AdminDeleteUserCommand,
  ListUsersCommand,
} = require('@aws-sdk/client-cognito-identity-provider');

const { cognitoClient, COGNITO_CONFIG } = require('../config/aws-v3');

class CognitoService {
  
  // =================================
  // 👤 User Information Operations
  // =================================

  /**
   * Get user details from Cognito
   */
  async getCognitoUser(userId) {
    try {
      const command = new AdminGetUserCommand({
        UserPoolId: COGNITO_CONFIG.UserPoolId,
        Username: userId
      });

      const result = await cognitoClient.send(command);
      
      // Parse user attributes
      const attributes = {};
      result.UserAttributes?.forEach(attr => {
        attributes[attr.Name] = attr.Value;
      });

      return {
        success: true,
        data: {
          userId: result.Username,
          email: attributes.email,
          emailVerified: attributes.email_verified === 'true',
          name: attributes.name,
          givenName: attributes.given_name,
          familyName: attributes.family_name,
          phone: attributes.phone_number,
          phoneVerified: attributes.phone_number_verified === 'true',
          enabled: result.Enabled,
          status: result.UserStatus,
          created: result.UserCreateDate,
          modified: result.UserLastModifiedDate,
          attributes: attributes
        }
      };
      
    } catch (error) {
      console.error('❌ Error getting Cognito user:', error);
      return {
        success: false,
        error: error.name,
        message: error.message
      };
    }
  }

  /**
   * Update user attributes in Cognito
   */
  async updateUserAttributes(userId, attributes) {
    try {
      const userAttributes = Object.entries(attributes).map(([name, value]) => ({
        Name: name,
        Value: String(value)
      }));

      const command = new AdminUpdateUserAttributesCommand({
        UserPoolId: COGNITO_CONFIG.UserPoolId,
        Username: userId,
        UserAttributes: userAttributes
      });

      await cognitoClient.send(command);
      
      console.log('✅ User attributes updated successfully:', userId);
      return {
        success: true,
        message: 'User attributes updated successfully'
      };
      
    } catch (error) {
      console.error('❌ Error updating user attributes:', error);
      return {
        success: false,
        error: error.name,
        message: error.message
      };
    }
  }

  // =================================
  // 🔒 User Management Operations
  // =================================

  /**
   * Set user password (admin operation)
   */
  async setUserPassword(userId, password, permanent = true) {
    try {
      const command = new AdminSetUserPasswordCommand({
        UserPoolId: COGNITO_CONFIG.UserPoolId,
        Username: userId,
        Password: password,
        Permanent: permanent
      });

      await cognitoClient.send(command);
      
      console.log('✅ User password set successfully:', userId);
      return {
        success: true,
        message: 'Password set successfully'
      };
      
    } catch (error) {
      console.error('❌ Error setting user password:', error);
      return {
        success: false,
        error: error.name,
        message: error.message
      };
    }
  }

  /**
   * Delete user from Cognito
   */
  async deleteUser(userId) {
    try {
      const command = new AdminDeleteUserCommand({
        UserPoolId: COGNITO_CONFIG.UserPoolId,
        Username: userId
      });

      await cognitoClient.send(command);
      
      console.log('✅ User deleted successfully:', userId);
      return {
        success: true,
        message: 'User deleted successfully'
      };
      
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      return {
        success: false,
        error: error.name,
        message: error.message
      };
    }
  }

  // =================================
  // 📋 User Listing Operations
  // =================================

  /**
   * List users in the user pool
   */
  async listUsers(limit = 20, paginationToken = null) {
    try {
      const command = new ListUsersCommand({
        UserPoolId: COGNITO_CONFIG.UserPoolId,
        Limit: limit,
        PaginationToken: paginationToken
      });

      const result = await cognitoClient.send(command);
      
      const users = result.Users?.map(user => {
        const attributes = {};
        user.Attributes?.forEach(attr => {
          attributes[attr.Name] = attr.Value;
        });

        return {
          userId: user.Username,
          email: attributes.email,
          name: attributes.name,
          status: user.UserStatus,
          enabled: user.Enabled,
          created: user.UserCreateDate,
          modified: user.UserLastModifiedDate
        };
      }) || [];

      return {
        success: true,
        data: {
          users: users,
          paginationToken: result.PaginationToken,
          hasMore: !!result.PaginationToken
        }
      };
      
    } catch (error) {
      console.error('❌ Error listing users:', error);
      return {
        success: false,
        error: error.name,
        message: error.message
      };
    }
  }

  // =================================
  // 🔄 Sync Operations with DynamoDB
  // =================================

  /**
   * Sync Cognito user with DynamoDB profile
   * This ensures user data consistency between Cognito and our app database
   */
  async syncUserWithDatabase(userId, userService) {
    try {
      console.log('🔄 Syncing Cognito user with database:', userId);
      
      // Get user from Cognito
      const cognitoResult = await this.getCognitoUser(userId);
      if (!cognitoResult.success) {
        return cognitoResult;
      }

      const cognitoUser = cognitoResult.data;
      
      // Check if user exists in our database
      const dbUser = await userService.getUserById(userId);
      
      if (!dbUser) {
        // User doesn't exist in our database, create profile
        const newUser = {
          id: userId,
          name: cognitoUser.name || cognitoUser.email?.split('@')[0] || 'User',
          email: cognitoUser.email,
          bio: '',
          location: '',
          skillsOffered: [],
          skillsWanted: [],
          profilePhoto: null,
          rating: 0,
          totalRatings: 0,
          emailVerified: cognitoUser.emailVerified,
          cognitoSynced: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const createResult = await userService.createUser(newUser);
        console.log('✅ User profile created from Cognito data:', userId);
        return createResult;
        
      } else {
        // User exists, update with Cognito data if needed
        const updates = {};
        
        if (dbUser.email !== cognitoUser.email) {
          updates.email = cognitoUser.email;
        }
        
        if (dbUser.emailVerified !== cognitoUser.emailVerified) {
          updates.emailVerified = cognitoUser.emailVerified;
        }
        
        if (!dbUser.cognitoSynced) {
          updates.cognitoSynced = true;
        }

        if (Object.keys(updates).length > 0) {
          updates.updatedAt = new Date().toISOString();
          const updateResult = await userService.updateUser(userId, updates);
          console.log('✅ User profile updated with Cognito data:', userId);
          return updateResult;
        }
        
        console.log('✅ User profile already in sync:', userId);
        return { success: true, data: dbUser };
      }
      
    } catch (error) {
      console.error('❌ Error syncing user with database:', error);
      return {
        success: false,
        error: 'SYNC_ERROR',
        message: 'Failed to sync user data'
      };
    }
  }

  // =================================
  // 🛡️ Utility Functions
  // =================================

  /**
   * Validate if user exists in Cognito
   */
  async userExists(userId) {
    const result = await this.getCognitoUser(userId);
    return result.success;
  }

  /**
   * Get user email from Cognito
   */
  async getUserEmail(userId) {
    const result = await this.getCognitoUser(userId);
    return result.success ? result.data.email : null;
  }

  /**
   * Check if user email is verified
   */
  async isEmailVerified(userId) {
    const result = await this.getCognitoUser(userId);
    return result.success ? result.data.emailVerified : false;
  }
}

// =================================
// 📤 Export Service
// =================================

module.exports = new CognitoService(); 