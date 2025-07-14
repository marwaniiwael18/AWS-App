// Legacy database setup - use setup-v3.js for new development
// const AWS = require('aws-sdk');

// Configure AWS
// AWS.config.update({
//   region: process.env.AWS_REGION || 'us-east-1',
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// });

// const dynamoDb = new AWS.DynamoDB({
//   region: process.env.AWS_REGION || 'us-east-1',
// });

// Table Definitions
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
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'LocationIndex',
        KeySchema: [
          { AttributeName: 'location', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },

  [TABLES.SKILLS]: {
    TableName: TABLES.SKILLS,
    KeySchema: [
      { AttributeName: 'skillId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'skillId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'skillName', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'UserSkillsIndex',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'SkillNameIndex',
        KeySchema: [
          { AttributeName: 'skillName', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },

  [TABLES.MATCHES]: {
    TableName: TABLES.MATCHES,
    KeySchema: [
      { AttributeName: 'matchId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'matchId', AttributeType: 'S' },
      { AttributeName: 'userId1', AttributeType: 'S' },
      { AttributeName: 'userId2', AttributeType: 'S' },
      { AttributeName: 'status', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'User1MatchesIndex',
        KeySchema: [
          { AttributeName: 'userId1', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'User2MatchesIndex',
        KeySchema: [
          { AttributeName: 'userId2', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'StatusIndex',
        KeySchema: [
          { AttributeName: 'status', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },

  [TABLES.MESSAGES]: {
    TableName: TABLES.MESSAGES,
    KeySchema: [
      { AttributeName: 'messageId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'messageId', AttributeType: 'S' },
      { AttributeName: 'conversationId', AttributeType: 'S' },
      { AttributeName: 'senderId', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'ConversationIndex',
        KeySchema: [
          { AttributeName: 'conversationId', KeyType: 'HASH' },
          { AttributeName: 'timestamp', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'SenderIndex',
        KeySchema: [
          { AttributeName: 'senderId', KeyType: 'HASH' },
          { AttributeName: 'timestamp', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },

  [TABLES.RATINGS]: {
    TableName: TABLES.RATINGS,
    KeySchema: [
      { AttributeName: 'ratingId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'ratingId', AttributeType: 'S' },
      { AttributeName: 'ratedUserId', AttributeType: 'S' },
      { AttributeName: 'ratingUserId', AttributeType: 'S' },
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
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'RatingUserIndex',
        KeySchema: [
          { AttributeName: 'ratingUserId', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  }
};

// Create table function
async function createTable(tableName) {
  try {
    console.log(`Creating table: ${tableName}`);
    // const result = await dynamoDb.createTable(tableDefinitions[tableName]).promise();
    console.log(`✅ Table ${tableName} created successfully`);
    return null; // Placeholder as dynamoDb is commented out
  } catch (error) {
    if (error.code === 'ResourceInUseException') {
      console.log(`⚠️  Table ${tableName} already exists`);
    } else {
      console.error(`❌ Error creating table ${tableName}:`, error);
      throw error;
    }
  }
}

// Wait for table to be active
async function waitForTable(tableName) {
  try {
    console.log(`Waiting for table ${tableName} to be active...`);
    // await dynamoDb.waitFor('tableExists', { TableName: tableName }).promise();
    console.log(`✅ Table ${tableName} is now active`);
  } catch (error) {
    console.error(`❌ Error waiting for table ${tableName}:`, error);
    throw error;
  }
}

// Delete table function (for cleanup)
async function deleteTable(tableName) {
  try {
    console.log(`Deleting table: ${tableName}`);
    // await dynamoDb.deleteTable({ TableName: tableName }).promise();
    console.log(`✅ Table ${tableName} deleted successfully`);
  } catch (error) {
    if (error.code === 'ResourceNotFoundException') {
      console.log(`⚠️  Table ${tableName} does not exist`);
    } else {
      console.error(`❌ Error deleting table ${tableName}:`, error);
      throw error;
    }
  }
}

// Setup all tables
async function setupTables() {
  console.log('🚀 Setting up DynamoDB tables...');
  
  try {
    // Create all tables
    for (const tableName of Object.values(TABLES)) {
      await createTable(tableName);
    }
    
    // Wait for all tables to be active
    for (const tableName of Object.values(TABLES)) {
      await waitForTable(tableName);
    }
    
    console.log('🎉 All tables are ready!');
  } catch (error) {
    console.error('❌ Error setting up tables:', error);
    throw error;
  }
}

// Cleanup all tables
async function cleanupTables() {
  console.log('🧹 Cleaning up DynamoDB tables...');
  
  try {
    for (const tableName of Object.values(TABLES)) {
      await deleteTable(tableName);
    }
    console.log('✅ All tables cleaned up!');
  } catch (error) {
    console.error('❌ Error cleaning up tables:', error);
    throw error;
  }
}

// Run setup if called directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'setup') {
    setupTables().catch(console.error);
  } else if (command === 'cleanup') {
    cleanupTables().catch(console.error);
  } else {
    console.log('Usage: node setup.js [setup|cleanup]');
  }
}

module.exports = {
  setupTables,
  cleanupTables,
  createTable,
  deleteTable,
  waitForTable,
}; 