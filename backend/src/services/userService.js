// Import configuration - gracefully handle AWS import issues
let dynamoDb, TABLES;
try {
  const awsConfig = require('../config/aws');
  dynamoDb = awsConfig.dynamoDb;
  TABLES = awsConfig.TABLES;
} catch (error) {
  console.log('⚠️  Using file storage - AWS config not available:', error.message);
  dynamoDb = null;
  TABLES = {
    USERS: 'skillswap-users',
    MATCHES: 'skillswap-matches', 
    MESSAGES: 'skillswap-messages',
    RATINGS: 'skillswap-ratings'
  };
}
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

// Initialize storage
async function initializeStorage() {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.dirname(DATA_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    
    // Load existing data from file
    try {
      const data = await fs.readFile(DATA_FILE, 'utf8');
      const usersData = JSON.parse(data);
      
      // Populate memory store from file
      Object.values(usersData).forEach(user => {
        memoryStore.users.set(user.userId, user);
        memoryStore.usersByEmail.set(user.email, user);
      });
      
      console.log(`Loaded ${Object.keys(usersData).length} users from storage`);
    } catch (fileError) {
      // File doesn't exist or is invalid, create with mock data
      console.log('No existing user data found, initializing with mock data');
      memoryStore.users.set('dev-user-123', mockUser);
      memoryStore.usersByEmail.set('dev@example.com', mockUser);
      await saveToFile();
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
    // Fallback to memory-only storage
    memoryStore.users.set('dev-user-123', mockUser);
    memoryStore.usersByEmail.set('dev@example.com', mockUser);
  }
}

// Save data to JSON file
async function saveToFile() {
  try {
    const usersData = {};
    memoryStore.users.forEach((user, userId) => {
      usersData[userId] = user;
    });
    
    await fs.writeFile(DATA_FILE, JSON.stringify(usersData, null, 2));
  } catch (error) {
    console.error('Error saving to file:', error);
  }
}

// Initialize storage on module load
initializeStorage();

class UserService {
  
  // Check if we're in development mode
  isDevelopmentMode() {
    return process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true';
  }
  
  // Create a new user
  async createUser(userData) {
    try {
      if (this.isDevelopmentMode()) {
        const userId = uuidv4();
        const timestamp = new Date().toISOString();
        
        const user = {
          userId,
          email: userData.email,
          name: userData.name,
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
        };

        memoryStore.users.set(userId, user);
        memoryStore.usersByEmail.set(user.email, user);
        await saveToFile();
        return user;
      }

      const userId = uuidv4();
      const timestamp = new Date().toISOString();
      
      const user = {
        userId,
        email: userData.email,
        name: userData.name,
        bio: userData.bio || '',
        location: userData.location || '',
        profilePicture: userData.profilePicture || '',
        skillsOffered: userData.skillsOffered || [],
        skillsWanted: userData.skillsWanted || [],
        rating: 0,
        totalRatings: 0,
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const params = {
        TableName: TABLES.USERS,
        Item: user,
        ConditionExpression: 'attribute_not_exists(userId)',
      };

      await dynamoDb.put(params).promise();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      if (this.isDevelopmentMode()) {
        return memoryStore.users.get(userId) || null;
      }

      const params = {
        TableName: TABLES.USERS,
        Key: { userId },
      };

      const result = await dynamoDb.get(params).promise();
      return result.Item;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  // Get user by email
  async getUserByEmail(email) {
    try {
      if (this.isDevelopmentMode()) {
        return memoryStore.usersByEmail.get(email) || null;
      }

      const params = {
        TableName: TABLES.USERS,
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email,
        },
      };

      const result = await dynamoDb.query(params).promise();
      return result.Items[0];
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUser(userId, updates) {
    try {
      if (this.isDevelopmentMode()) {
        const existingUser = memoryStore.users.get(userId);
        if (!existingUser) {
          throw new Error('User not found');
        }

        const timestamp = new Date().toISOString();
        const updatedUser = {
          ...existingUser,
          ...updates,
          userId: existingUser.userId, // Don't allow userId to be changed
          createdAt: existingUser.createdAt, // Don't allow createdAt to be changed
          updatedAt: timestamp,
        };

        memoryStore.users.set(userId, updatedUser);
        
        // Update email index if email changed
        if (updates.email && updates.email !== existingUser.email) {
          memoryStore.usersByEmail.delete(existingUser.email);
          memoryStore.usersByEmail.set(updates.email, updatedUser);
        }

        // Save to file
        await saveToFile();

        return updatedUser;
      }

      const timestamp = new Date().toISOString();
      
      // Build update expression dynamically
      const updateExpression = [];
      const expressionAttributeNames = {};
      const expressionAttributeValues = {};
      
      Object.keys(updates).forEach((key) => {
        if (key !== 'userId' && key !== 'createdAt') {
          updateExpression.push(`#${key} = :${key}`);
          expressionAttributeNames[`#${key}`] = key;
          expressionAttributeValues[`:${key}`] = updates[key];
        }
      });
      
      updateExpression.push('#updatedAt = :updatedAt');
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
      expressionAttributeValues[':updatedAt'] = timestamp;

      const params = {
        TableName: TABLES.USERS,
        Key: { userId },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      };

      const result = await dynamoDb.update(params).promise();
      return result.Attributes;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Get users by location (for finding nearby users)
  async getUsersByLocation(location, limit = 50) {
    try {
      const params = {
        TableName: TABLES.USERS,
        IndexName: 'LocationIndex',
        KeyConditionExpression: '#location = :location',
        ExpressionAttributeNames: {
          '#location': 'location',
        },
        ExpressionAttributeValues: {
          ':location': location,
        },
        Limit: limit,
      };

      const result = await dynamoDb.query(params).promise();
      return result.Items;
    } catch (error) {
      console.error('Error getting users by location:', error);
      throw error;
    }
  }

  // Search users by skills
  async searchUsersBySkills(skills, excludeUserId = null) {
    try {
      const params = {
        TableName: TABLES.USERS,
        FilterExpression: 'contains(skillsOffered, :skill)',
        ExpressionAttributeValues: {
          ':skill': skills[0], // For now, search by first skill
        },
      };

      if (excludeUserId) {
        params.FilterExpression += ' AND userId <> :excludeUserId';
        params.ExpressionAttributeValues[':excludeUserId'] = excludeUserId;
      }

      const result = await dynamoDb.scan(params).promise();
      return result.Items;
    } catch (error) {
      console.error('Error searching users by skills:', error);
      throw error;
    }
  }

  // Add skill to user
  async addSkill(userId, skill, type = 'offered') {
    try {
      if (this.isDevelopmentMode()) {
        const user = memoryStore.users.get(userId);
        if (!user) {
          throw new Error('User not found');
        }

        const skillField = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
        const skills = user[skillField] || [];
        
        if (!skills.includes(skill)) {
          skills.push(skill);
          const updatedUser = {
            ...user,
            [skillField]: skills,
            updatedAt: new Date().toISOString()
          };
          
          memoryStore.users.set(userId, updatedUser);
          
          // Update email index
          if (user.email) {
            memoryStore.usersByEmail.set(user.email, updatedUser);
          }
          
          await saveToFile();
          return updatedUser;
        }
        
        return user;
      }

      const skillField = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
      const timestamp = new Date().toISOString();

      const params = {
        TableName: TABLES.USERS,
        Key: { userId },
        UpdateExpression: `SET ${skillField} = list_append(if_not_exists(${skillField}, :empty_list), :skill), updatedAt = :updatedAt`,
        ExpressionAttributeValues: {
          ':skill': [skill],
          ':empty_list': [],
          ':updatedAt': timestamp,
        },
        ReturnValues: 'ALL_NEW',
      };

      const result = await dynamoDb.update(params).promise();
      return result.Attributes;
    } catch (error) {
      console.error('Error adding skill:', error);
      throw error;
    }
  }

  // Remove skill from user
  async removeSkill(userId, skill, type = 'offered') {
    try {
      if (this.isDevelopmentMode()) {
        const user = memoryStore.users.get(userId);
        if (!user) {
          throw new Error('User not found');
        }

        const skillField = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
        const skills = user[skillField] || [];
        const skillIndex = skills.indexOf(skill);

        if (skillIndex === -1) {
          throw new Error('Skill not found');
        }

        const updatedSkills = [...skills];
        updatedSkills.splice(skillIndex, 1);
        
        const updatedUser = {
          ...user,
          [skillField]: updatedSkills,
          updatedAt: new Date().toISOString()
        };
        
        memoryStore.users.set(userId, updatedUser);
        
        // Update email index
        if (user.email) {
          memoryStore.usersByEmail.set(user.email, updatedUser);
        }
        
        await saveToFile();
        return updatedUser;
      }

      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const skillField = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
      const skills = user[skillField] || [];
      const skillIndex = skills.indexOf(skill);

      if (skillIndex === -1) {
        throw new Error('Skill not found');
      }

      const timestamp = new Date().toISOString();

      const params = {
        TableName: TABLES.USERS,
        Key: { userId },
        UpdateExpression: `REMOVE ${skillField}[${skillIndex}] SET updatedAt = :updatedAt`,
        ExpressionAttributeValues: {
          ':updatedAt': timestamp,
        },
        ReturnValues: 'ALL_NEW',
      };

      const result = await dynamoDb.update(params).promise();
      return result.Attributes;
    } catch (error) {
      console.error('Error removing skill:', error);
      throw error;
    }
  }

  // Update user rating
  async updateUserRating(userId, newRating) {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const currentRating = user.rating || 0;
      const totalRatings = user.totalRatings || 0;
      const newTotalRatings = totalRatings + 1;
      const updatedRating = ((currentRating * totalRatings) + newRating) / newTotalRatings;

      const timestamp = new Date().toISOString();

      const params = {
        TableName: TABLES.USERS,
        Key: { userId },
        UpdateExpression: 'SET rating = :rating, totalRatings = :totalRatings, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':rating': Math.round(updatedRating * 10) / 10, // Round to 1 decimal place
          ':totalRatings': newTotalRatings,
          ':updatedAt': timestamp,
        },
        ReturnValues: 'ALL_NEW',
      };

      const result = await dynamoDb.update(params).promise();
      return result.Attributes;
    } catch (error) {
      console.error('Error updating user rating:', error);
      throw error;
    }
  }

  // Get all users (with pagination)
  async getAllUsers(limit = 50, lastEvaluatedKey = null) {
    try {
      const params = {
        TableName: TABLES.USERS,
        Limit: limit,
      };

      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }

      const result = await dynamoDb.scan(params).promise();
      return {
        users: result.Items,
        lastEvaluatedKey: result.LastEvaluatedKey,
      };
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Delete user (soft delete)
  async deleteUser(userId) {
    try {
      const timestamp = new Date().toISOString();

      const params = {
        TableName: TABLES.USERS,
        Key: { userId },
        UpdateExpression: 'SET isActive = :isActive, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':isActive': false,
          ':updatedAt': timestamp,
        },
        ReturnValues: 'ALL_NEW',
      };

      const result = await dynamoDb.update(params).promise();
      return result.Attributes;
    } catch (error) {
      console.error('Error deleting user:', error);
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

      const skillsWanted = user.skillsWanted || [];
      const skillsOffered = user.skillsOffered || [];

      if (skillsWanted.length === 0 && skillsOffered.length === 0) {
        return [];
      }

      // This is a simplified matching algorithm
      // In production, you'd want more sophisticated matching
      const params = {
        TableName: TABLES.USERS,
        FilterExpression: 'userId <> :userId AND isActive = :isActive',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':isActive': true,
        },
        Limit: limit * 2, // Get more to filter better matches
      };

      const result = await dynamoDb.scan(params).promise();
      const potentialMatches = result.Items;

      // Calculate match scores
      const matches = potentialMatches.map(match => {
        const matchSkillsOffered = match.skillsOffered || [];
        const matchSkillsWanted = match.skillsWanted || [];

        // Calculate compatibility score
        const wantedMatches = skillsWanted.filter(skill => 
          matchSkillsOffered.includes(skill)
        ).length;
        
        const offeredMatches = skillsOffered.filter(skill => 
          matchSkillsWanted.includes(skill)
        ).length;

        const totalPossibleMatches = Math.max(
          skillsWanted.length + skillsOffered.length,
          matchSkillsOffered.length + matchSkillsWanted.length,
          1
        );

        const compatibility = (wantedMatches + offeredMatches) / totalPossibleMatches;

        return {
          ...match,
          compatibility: Math.round(compatibility * 100) / 100,
          matchingSkills: [
            ...skillsWanted.filter(skill => matchSkillsOffered.includes(skill)),
            ...skillsOffered.filter(skill => matchSkillsWanted.includes(skill))
          ],
        };
      });

      // Sort by compatibility and return top matches
      return matches
        .filter(match => match.compatibility > 0)
        .sort((a, b) => b.compatibility - a.compatibility)
        .slice(0, limit);
    } catch (error) {
      console.error('Error finding potential matches:', error);
      throw error;
    }
  }
}

module.exports = new UserService(); 