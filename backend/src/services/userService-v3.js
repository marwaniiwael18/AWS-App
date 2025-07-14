const { PutCommand, GetCommand, QueryCommand, ScanCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { dynamoDb, TABLES, DB_CONFIG } = require('../config/aws-v3');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

// JSON file storage for development
const DATA_FILE = path.join(process.cwd(), 'data', 'users.json');

// In-memory storage for development
const memoryStore = {
  users: new Map(),
  usersByEmail: new Map()
};

// Mock user data for development
const mockUser = {
  userId: 'dev-user-123',
  email: 'dev@example.com',
  name: 'Development User',
  bio: 'This is a development user for testing purposes.',
  location: 'Development City',
  profilePhoto: null,
  skillsOffered: ['JavaScript', 'React', 'Node.js'],
  skillsWanted: ['Python', 'Machine Learning', 'Data Science'],
  rating: 4.8,
  totalRatings: 25,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
};

// Initialize storage based on configuration
async function initializeStorage() {
  if (DB_CONFIG.USE_DYNAMODB) {
    console.log('🗄️  Using DynamoDB for user storage');
    return;
  }

  console.log('📁 Using file storage for development');
  
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(DATA_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    
    // Check if file exists
    try {
      const data = await fs.readFile(DATA_FILE, 'utf8');
      const users = JSON.parse(data);
      
      // Load users into memory store
      users.forEach(user => {
        memoryStore.users.set(user.userId, user);
        memoryStore.usersByEmail.set(user.email, user);
      });
      
      console.log(`Loaded ${users.length} users from storage`);
    } catch (error) {
      // File doesn't exist, create with mock user
      memoryStore.users.set(mockUser.userId, mockUser);
      memoryStore.usersByEmail.set(mockUser.email, mockUser);
      await saveToFile();
      console.log('Created initial user data file with mock user');
    }
  } catch (error) {
    console.error('Error initializing file storage:', error);
    throw error;
  }
}

// Save data to file (only for file storage)
async function saveToFile() {
  if (DB_CONFIG.USE_DYNAMODB) return;
  
  try {
    const users = Array.from(memoryStore.users.values());
    await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving to file:', error);
  }
}

class UserService {
  
  // Check if we're in development mode
  isDevelopmentMode() {
    return process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true';
  }

  // Check if using DynamoDB
  isUsingDynamoDB() {
    return DB_CONFIG.USE_DYNAMODB;
  }
  
  // Create a new user
  async createUser(userData) {
    try {
      const userId = uuidv4();
      const timestamp = new Date().toISOString();
      
      const user = {
        userId,
        email: userData.email,
        name: userData.name || '',
        bio: userData.bio || '',
        location: userData.location || '',
        profilePhoto: userData.profilePhoto || null,
        skillsOffered: userData.skillsOffered || [],
        skillsWanted: userData.skillsWanted || [],
        rating: 0,
        totalRatings: 0,
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
        ...userData
      };

      if (this.isUsingDynamoDB()) {
        // DynamoDB implementation
        const command = new PutCommand({
          TableName: TABLES.USERS,
          Item: user,
          ConditionExpression: 'attribute_not_exists(userId)'
        });

        await dynamoDb.send(command);
        console.log(`✅ User created in DynamoDB: ${userId}`);
      } else {
        // File storage implementation
        if (memoryStore.usersByEmail.has(user.email)) {
          throw new Error('User with this email already exists');
        }
        
        memoryStore.users.set(userId, user);
        memoryStore.usersByEmail.set(user.email, user);
        await saveToFile();
        console.log(`✅ User created in file storage: ${userId}`);
      }

      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      if (this.isUsingDynamoDB()) {
        // DynamoDB implementation
        const command = new GetCommand({
          TableName: TABLES.USERS,
          Key: { userId }
        });

        const result = await dynamoDb.send(command);
        return result.Item || null;
      } else {
        // File storage implementation
        return memoryStore.users.get(userId) || null;
      }
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  // Get user by email
  async getUserByEmail(email) {
    try {
      if (this.isUsingDynamoDB()) {
        // DynamoDB implementation
        const command = new QueryCommand({
          TableName: TABLES.USERS,
          IndexName: 'EmailIndex',
          KeyConditionExpression: 'email = :email',
          ExpressionAttributeValues: {
            ':email': email
          }
        });

        const result = await dynamoDb.send(command);
        return result.Items && result.Items.length > 0 ? result.Items[0] : null;
      } else {
        // File storage implementation
        return memoryStore.usersByEmail.get(email) || null;
      }
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(userId, updates) {
    try {
      const timestamp = new Date().toISOString();
      updates.updatedAt = timestamp;

      if (this.isUsingDynamoDB()) {
        // DynamoDB implementation
        const updateExpression = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        Object.keys(updates).forEach((key, index) => {
          const nameKey = `#attr${index}`;
          const valueKey = `:val${index}`;
          updateExpression.push(`${nameKey} = ${valueKey}`);
          expressionAttributeNames[nameKey] = key;
          expressionAttributeValues[valueKey] = updates[key];
        });

        const command = new UpdateCommand({
          TableName: TABLES.USERS,
          Key: { userId },
          UpdateExpression: `SET ${updateExpression.join(', ')}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: 'ALL_NEW'
        });

        const result = await dynamoDb.send(command);
        return result.Attributes;
      } else {
        // File storage implementation
        const user = memoryStore.users.get(userId);
        if (!user) {
          throw new Error('User not found');
        }

        // Update user data
        const updatedUser = { ...user, ...updates };
        
        // Update in memory stores
        memoryStore.users.set(userId, updatedUser);
        if (user.email !== updatedUser.email) {
          memoryStore.usersByEmail.delete(user.email);
          memoryStore.usersByEmail.set(updatedUser.email, updatedUser);
        }

        await saveToFile();
        return updatedUser;
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Get users by location
  async getUsersByLocation(location, limit = 50) {
    try {
      if (this.isUsingDynamoDB()) {
        // DynamoDB implementation
        const command = new QueryCommand({
          TableName: TABLES.USERS,
          IndexName: 'LocationIndex',
          KeyConditionExpression: '#location = :location',
          ExpressionAttributeNames: {
            '#location': 'location'
          },
          ExpressionAttributeValues: {
            ':location': location
          },
          Limit: limit,
          ScanIndexForward: false // Most recent first
        });

        const result = await dynamoDb.send(command);
        return result.Items || [];
      } else {
        // File storage implementation
        const users = Array.from(memoryStore.users.values())
          .filter(user => user.location === location && user.isActive)
          .slice(0, limit);
        return users;
      }
    } catch (error) {
      console.error('Error getting users by location:', error);
      throw error;
    }
  }

  // Search users by skills
  async searchUsersBySkills(skills, excludeUserId = null) {
    try {
      if (this.isUsingDynamoDB()) {
        // DynamoDB implementation - scan for skill matches
        const command = new ScanCommand({
          TableName: TABLES.USERS,
          FilterExpression: skills.map((_, index) => 
            `contains(skillsOffered, :skill${index})`
          ).join(' OR '),
          ExpressionAttributeValues: skills.reduce((acc, skill, index) => {
            acc[`:skill${index}`] = skill;
            return acc;
          }, {})
        });

        const result = await dynamoDb.send(command);
        let users = result.Items || [];
        
        if (excludeUserId) {
          users = users.filter(user => user.userId !== excludeUserId);
        }
        
        return users;
      } else {
        // File storage implementation
        const users = Array.from(memoryStore.users.values())
          .filter(user => {
            if (!user.isActive || user.userId === excludeUserId) return false;
            return skills.some(skill => 
              user.skillsOffered.includes(skill)
            );
          });
        return users;
      }
    } catch (error) {
      console.error('Error searching users by skills:', error);
      throw error;
    }
  }

  // Add skill to user
  async addSkill(userId, skill, type = 'offered') {
    try {
      const skillField = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
      
      if (this.isUsingDynamoDB()) {
        // DynamoDB implementation
        const command = new UpdateCommand({
          TableName: TABLES.USERS,
          Key: { userId },
          UpdateExpression: `ADD ${skillField} :skill SET updatedAt = :timestamp`,
          ExpressionAttributeValues: {
            ':skill': new Set([skill]),
            ':timestamp': new Date().toISOString()
          },
          ReturnValues: 'ALL_NEW'
        });

        const result = await dynamoDb.send(command);
        return result.Attributes;
      } else {
        // File storage implementation
        const user = memoryStore.users.get(userId);
        if (!user) {
          throw new Error('User not found');
        }

        const skills = user[skillField];
        if (!skills.includes(skill)) {
          skills.push(skill);
          user.updatedAt = new Date().toISOString();
          
          memoryStore.users.set(userId, user);
          await saveToFile();
        }

        return user;
      }
    } catch (error) {
      console.error('Error adding skill:', error);
      throw error;
    }
  }

  // Remove skill from user
  async removeSkill(userId, skill, type = 'offered') {
    try {
      const skillField = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
      
      if (this.isUsingDynamoDB()) {
        // DynamoDB implementation
        const command = new UpdateCommand({
          TableName: TABLES.USERS,
          Key: { userId },
          UpdateExpression: `DELETE ${skillField} :skill SET updatedAt = :timestamp`,
          ExpressionAttributeValues: {
            ':skill': new Set([skill]),
            ':timestamp': new Date().toISOString()
          },
          ReturnValues: 'ALL_NEW'
        });

        const result = await dynamoDb.send(command);
        return result.Attributes;
      } else {
        // File storage implementation
        const user = memoryStore.users.get(userId);
        if (!user) {
          throw new Error('User not found');
        }

        const skills = user[skillField];
        const skillIndex = skills.indexOf(skill);
        if (skillIndex > -1) {
          skills.splice(skillIndex, 1);
          user.updatedAt = new Date().toISOString();
          
          memoryStore.users.set(userId, user);
          await saveToFile();
        }

        return user;
      }
    } catch (error) {
      console.error('Error removing skill:', error);
      throw error;
    }
  }

  // Get all users with pagination
  async getAllUsers(limit = 50, lastEvaluatedKey = null) {
    try {
      if (this.isUsingDynamoDB()) {
        // DynamoDB implementation
        const params = {
          TableName: TABLES.USERS,
          Limit: limit
        };

        if (lastEvaluatedKey) {
          params.ExclusiveStartKey = lastEvaluatedKey;
        }

        const command = new ScanCommand(params);
        const result = await dynamoDb.send(command);
        
        return {
          users: result.Items || [],
          lastEvaluatedKey: result.LastEvaluatedKey
        };
      } else {
        // File storage implementation
        const users = Array.from(memoryStore.users.values())
          .filter(user => user.isActive)
          .slice(0, limit);
        
        return {
          users,
          lastEvaluatedKey: null
        };
      }
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(userId) {
    try {
      if (this.isUsingDynamoDB()) {
        // DynamoDB implementation
        const command = new DeleteCommand({
          TableName: TABLES.USERS,
          Key: { userId }
        });

        await dynamoDb.send(command);
      } else {
        // File storage implementation
        const user = memoryStore.users.get(userId);
        if (user) {
          memoryStore.users.delete(userId);
          memoryStore.usersByEmail.delete(user.email);
          await saveToFile();
        }
      }

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Update user rating
  async updateUserRating(userId, newRating) {
    try {
      if (this.isUsingDynamoDB()) {
        // DynamoDB implementation
        const command = new UpdateCommand({
          TableName: TABLES.USERS,
          Key: { userId },
          UpdateExpression: 'SET rating = :rating, totalRatings = totalRatings + :inc, updatedAt = :timestamp',
          ExpressionAttributeValues: {
            ':rating': newRating,
            ':inc': 1,
            ':timestamp': new Date().toISOString()
          },
          ReturnValues: 'ALL_NEW'
        });

        const result = await dynamoDb.send(command);
        return result.Attributes;
      } else {
        // File storage implementation
        const user = memoryStore.users.get(userId);
        if (!user) {
          throw new Error('User not found');
        }

        user.rating = newRating;
        user.totalRatings += 1;
        user.updatedAt = new Date().toISOString();

        memoryStore.users.set(userId, user);
        await saveToFile();
        return user;
      }
    } catch (error) {
      console.error('Error updating user rating:', error);
      throw error;
    }
  }

  // Find potential matches for a user
  async findPotentialMatches(userId, limit = 20) {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Find users who offer skills that this user wants
      const potentialMatches = await this.searchUsersBySkills(user.skillsWanted, userId);
      
      // Sort by relevance (how many matching skills)
      const matches = potentialMatches
        .map(match => {
          const matchingSkills = match.skillsOffered.filter(skill => 
            user.skillsWanted.includes(skill)
          );
          return {
            ...match,
            matchingSkills,
            relevanceScore: matchingSkills.length
          };
        })
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);

      return matches;
    } catch (error) {
      console.error('Error finding potential matches:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats(userId) {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        totalSkillsOffered: user.skillsOffered.length,
        totalSkillsWanted: user.skillsWanted.length,
        rating: user.rating,
        totalRatings: user.totalRatings,
        isActive: user.isActive,
        memberSince: user.createdAt
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }
}

// Initialize storage on module load
initializeStorage().catch(error => {
  console.error('Failed to initialize user storage:', error);
});

module.exports = new UserService(); 