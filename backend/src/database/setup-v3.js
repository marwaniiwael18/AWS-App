const { DynamoDBClient, CreateTableCommand, DeleteTableCommand, DescribeTableCommand, waitUntilTableExists, waitUntilTableNotExists } = require('@aws-sdk/client-dynamodb');
const { TABLES, awsConfig } = require('../config/aws-v3');

const dynamoDBClient = new DynamoDBClient(awsConfig);

// Table Definitions for AWS SDK v3
const tableDefinitions = {
  [TABLES.USERS]: {
    TableName: TABLES.USERS,
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' },
      { AttributeName: 'location', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'EmailIndex',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST'
      },
      {
        IndexName: 'LocationIndex',
        KeySchema: [
          { AttributeName: 'location', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST'
      }
    ],
    BillingMode: 'PAY_PER_REQUEST', // On-demand pricing
    StreamSpecification: {
      StreamEnabled: true,
      StreamViewType: 'NEW_AND_OLD_IMAGES'
    }
  },

  [TABLES.MATCHES]: {
    TableName: TABLES.MATCHES,
    KeySchema: [
      { AttributeName: 'matchId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'matchId', AttributeType: 'S' },
      { AttributeName: 'requesterId', AttributeType: 'S' },
      { AttributeName: 'receiverId', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'RequesterIndex',
        KeySchema: [
          { AttributeName: 'requesterId', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST'
      },
      {
        IndexName: 'ReceiverIndex',
        KeySchema: [
          { AttributeName: 'receiverId', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST'
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },

  [TABLES.MESSAGES]: {
    TableName: TABLES.MESSAGES,
    KeySchema: [
      { AttributeName: 'chatId', KeyType: 'HASH' },
      { AttributeName: 'timestamp', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'chatId', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'S' },
      { AttributeName: 'senderId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'SenderIndex',
        KeySchema: [
          { AttributeName: 'senderId', KeyType: 'HASH' },
          { AttributeName: 'timestamp', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST'
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },

  [TABLES.RATINGS]: {
    TableName: TABLES.RATINGS,
    KeySchema: [
      { AttributeName: 'ratingId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'ratingId', AttributeType: 'S' },
      { AttributeName: 'ratedUserId', AttributeType: 'S' },
      { AttributeName: 'raterUserId', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'RatedUserIndex',
        KeySchema: [
          { AttributeName: 'ratedUserId', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST'
      },
      {
        IndexName: 'RaterUserIndex',
        KeySchema: [
          { AttributeName: 'raterUserId', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST'
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  }
};

// Create a single table
async function createTable(tableName) {
  try {
    const command = new CreateTableCommand(tableDefinitions[tableName]);
    const result = await dynamoDBClient.send(command);
    console.log(`📝 Creating table: ${tableName}...`);
    
    // Wait for table to be created
    await waitUntilTableExists(
      { client: dynamoDBClient, maxWaitTime: 300 },
      { TableName: tableName }
    );
    
    console.log(`✅ Table created successfully: ${tableName}`);
    return result;
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log(`⚠️  Table already exists: ${tableName}`);
    } else {
      console.error(`❌ Error creating table ${tableName}:`, error.message);
      throw error;
    }
  }
}

// Delete a single table
async function deleteTable(tableName) {
  try {
    const command = new DeleteTableCommand({ TableName: tableName });
    await dynamoDBClient.send(command);
    console.log(`🗑️  Deleting table: ${tableName}...`);
    
    // Wait for table to be deleted
    await waitUntilTableNotExists(
      { client: dynamoDBClient, maxWaitTime: 300 },
      { TableName: tableName }
    );
    
    console.log(`✅ Table deleted successfully: ${tableName}`);
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      console.log(`ℹ️  Table doesn't exist: ${tableName}`);
    } else {
      console.error(`❌ Error deleting table ${tableName}:`, error.message);
      throw error;
    }
  }
}

// Setup all tables
async function setupTables() {
  console.log('🚀 Setting up DynamoDB tables with AWS SDK v3...');
  console.log(`📍 Region: ${awsConfig.region}`);
  
  const tableNames = Object.values(TABLES);
  
  for (const tableName of tableNames) {
    await createTable(tableName);
  }
  
  console.log('🎉 All DynamoDB tables setup completed!');
}

// Cleanup all tables
async function cleanupTables() {
  console.log('🧹 Cleaning up DynamoDB tables...');
  
  const tableNames = Object.values(TABLES);
  
  for (const tableName of tableNames) {
    await deleteTable(tableName);
  }
  
  console.log('✅ All tables cleaned up!');
}

// Check if table exists
async function tableExists(tableName) {
  try {
    const command = new DescribeTableCommand({ TableName: tableName });
    await dynamoDBClient.send(command);
    return true;
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      return false;
    }
    throw error;
  }
}

module.exports = {
  setupTables,
  cleanupTables,
  createTable,
  deleteTable,
  tableExists,
  tableDefinitions
}; 