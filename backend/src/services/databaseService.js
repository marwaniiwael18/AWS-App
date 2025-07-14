// Legacy database service - use userService-v3.js for new development
const { MongoClient } = require('mongodb');
const { Pool } = require('pg');

class DatabaseService {
  constructor() {
    this.dbType = process.env.DB_TYPE || 'dynamodb';
    this.initializeDatabase();
  }

  initializeDatabase() {
    switch (this.dbType) {
      case 'dynamodb':
        this.dynamodb = new AWS.DynamoDB.DocumentClient({
          region: process.env.AWS_REGION || 'us-east-1'
        });
        break;
      
      case 'mongodb':
        this.mongoClient = new MongoClient(process.env.MONGODB_URI);
        this.connectMongoDB();
        break;
      
      case 'postgresql':
        this.pgPool = new Pool({
          connectionString: process.env.DATABASE_URL
        });
        break;
      
      default:
        console.warn('No database type specified, using in-memory storage');
        this.memoryStore = {
          users: new Map(),
          skills: new Map(),
          matches: new Map(),
          messages: new Map()
        };
    }
  }

  async connectMongoDB() {
    try {
      await this.mongoClient.connect();
      this.mongodb = this.mongoClient.db('skillswap');
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
    }
  }

  // User Operations
  async createUser(userData) {
    const user = {
      id: this.generateId(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    switch (this.dbType) {
      case 'dynamodb':
        await this.dynamodb.put({
          TableName: process.env.DYNAMODB_TABLE_USERS,
          Item: user
        }).promise();
        break;
      
      case 'mongodb':
        await this.mongodb.collection('users').insertOne(user);
        break;
      
      case 'postgresql':
        await this.pgPool.query(
          'INSERT INTO users (id, email, name, bio, skills_offered, skills_wanted) VALUES ($1, $2, $3, $4, $5, $6)',
          [user.id, user.email, user.name, user.bio, user.skillsOffered, user.skillsWanted]
        );
        break;
      
      default:
        this.memoryStore.users.set(user.id, user);
    }

    return user;
  }

  async getUserById(userId) {
    switch (this.dbType) {
      case 'dynamodb':
        const result = await this.dynamodb.get({
          TableName: process.env.DYNAMODB_TABLE_USERS,
          Key: { id: userId }
        }).promise();
        return result.Item;
      
      case 'mongodb':
        return await this.mongodb.collection('users').findOne({ id: userId });
      
      case 'postgresql':
        const pgResult = await this.pgPool.query('SELECT * FROM users WHERE id = $1', [userId]);
        return pgResult.rows[0];
      
      default:
        return this.memoryStore.users.get(userId);
    }
  }

  async updateUser(userId, updates) {
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    switch (this.dbType) {
      case 'dynamodb':
        const updateExpression = 'SET ' + Object.keys(updatedData).map(key => `#${key} = :${key}`).join(', ');
        const expressionAttributeNames = Object.keys(updatedData).reduce((acc, key) => {
          acc[`#${key}`] = key;
          return acc;
        }, {});
        const expressionAttributeValues = Object.keys(updatedData).reduce((acc, key) => {
          acc[`:${key}`] = updatedData[key];
          return acc;
        }, {});

        await this.dynamodb.update({
          TableName: process.env.DYNAMODB_TABLE_USERS,
          Key: { id: userId },
          UpdateExpression: updateExpression,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues
        }).promise();
        break;
      
      case 'mongodb':
        await this.mongodb.collection('users').updateOne(
          { id: userId },
          { $set: updatedData }
        );
        break;
      
      case 'postgresql':
        const setClause = Object.keys(updatedData).map((key, index) => `${key} = $${index + 2}`).join(', ');
        const values = [userId, ...Object.values(updatedData)];
        await this.pgPool.query(`UPDATE users SET ${setClause} WHERE id = $1`, values);
        break;
      
      default:
        const existingUser = this.memoryStore.users.get(userId);
        if (existingUser) {
          this.memoryStore.users.set(userId, { ...existingUser, ...updatedData });
        }
    }

    return await this.getUserById(userId);
  }

  // Match Operations
  async createMatch(matchData) {
    const match = {
      id: this.generateId(),
      ...matchData,
      createdAt: new Date().toISOString()
    };

    switch (this.dbType) {
      case 'dynamodb':
        await this.dynamodb.put({
          TableName: process.env.DYNAMODB_TABLE_MATCHES,
          Item: match
        }).promise();
        break;
      
      case 'mongodb':
        await this.mongodb.collection('matches').insertOne(match);
        break;
      
      case 'postgresql':
        await this.pgPool.query(
          'INSERT INTO matches (id, user1_id, user2_id, status) VALUES ($1, $2, $3, $4)',
          [match.id, match.user1Id, match.user2Id, match.status]
        );
        break;
      
      default:
        this.memoryStore.matches.set(match.id, match);
    }

    return match;
  }

  async getMatchesByUserId(userId) {
    switch (this.dbType) {
      case 'dynamodb':
        const scanResult = await this.dynamodb.scan({
          TableName: process.env.DYNAMODB_TABLE_MATCHES,
          FilterExpression: 'user1Id = :userId OR user2Id = :userId',
          ExpressionAttributeValues: { ':userId': userId }
        }).promise();
        return scanResult.Items;
      
      case 'mongodb':
        return await this.mongodb.collection('matches').find({
          $or: [{ user1Id: userId }, { user2Id: userId }]
        }).toArray();
      
      case 'postgresql':
        const pgResult = await this.pgPool.query(
          'SELECT * FROM matches WHERE user1_id = $1 OR user2_id = $1',
          [userId]
        );
        return pgResult.rows;
      
      default:
        return Array.from(this.memoryStore.matches.values()).filter(
          match => match.user1Id === userId || match.user2Id === userId
        );
    }
  }

  // Message Operations
  async createMessage(messageData) {
    const message = {
      id: this.generateId(),
      ...messageData,
      createdAt: new Date().toISOString()
    };

    switch (this.dbType) {
      case 'dynamodb':
        await this.dynamodb.put({
          TableName: process.env.DYNAMODB_TABLE_MESSAGES,
          Item: message
        }).promise();
        break;
      
      case 'mongodb':
        await this.mongodb.collection('messages').insertOne(message);
        break;
      
      case 'postgresql':
        await this.pgPool.query(
          'INSERT INTO messages (id, match_id, sender_id, content) VALUES ($1, $2, $3, $4)',
          [message.id, message.matchId, message.senderId, message.content]
        );
        break;
      
      default:
        this.memoryStore.messages.set(message.id, message);
    }

    return message;
  }

  async getMessagesByMatchId(matchId) {
    switch (this.dbType) {
      case 'dynamodb':
        const queryResult = await this.dynamodb.query({
          TableName: process.env.DYNAMODB_TABLE_MESSAGES,
          IndexName: 'MatchIdIndex',
          KeyConditionExpression: 'matchId = :matchId',
          ExpressionAttributeValues: { ':matchId': matchId }
        }).promise();
        return queryResult.Items;
      
      case 'mongodb':
        return await this.mongodb.collection('messages').find({ matchId }).toArray();
      
      case 'postgresql':
        const pgResult = await this.pgPool.query(
          'SELECT * FROM messages WHERE match_id = $1 ORDER BY created_at ASC',
          [matchId]
        );
        return pgResult.rows;
      
      default:
        return Array.from(this.memoryStore.messages.values()).filter(
          message => message.matchId === matchId
        );
    }
  }

  // Utility Methods
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async close() {
    if (this.mongoClient) {
      await this.mongoClient.close();
    }
    if (this.pgPool) {
      await this.pgPool.end();
    }
  }
}

module.exports = new DatabaseService(); 