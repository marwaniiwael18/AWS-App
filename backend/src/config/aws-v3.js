const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { S3Client } = require('@aws-sdk/client-s3');
const { CognitoIdentityProviderClient } = require('@aws-sdk/client-cognito-identity-provider');
require('dotenv').config();

// AWS Configuration
const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

// Initialize DynamoDB Client (v3)
const dynamoDBClient = new DynamoDBClient(awsConfig);
const dynamoDb = DynamoDBDocumentClient.from(dynamoDBClient);

// Initialize S3 Client (v3)
const s3Client = new S3Client(awsConfig);

// Initialize Cognito Client (v3)
const cognitoClient = new CognitoIdentityProviderClient(awsConfig);

// DynamoDB Table Names
const TABLES = {
  USERS: process.env.USERS_TABLE || 'skillswap-users',
  SKILLS: process.env.SKILLS_TABLE || 'skillswap-skills',
  MATCHES: process.env.MATCHES_TABLE || 'skillswap-matches',
  MESSAGES: process.env.MESSAGES_TABLE || 'skillswap-messages',
  RATINGS: process.env.RATINGS_TABLE || 'skillswap-ratings',
};

// Cognito User Pool Configuration
const COGNITO_CONFIG = {
  UserPoolId: process.env.COGNITO_USER_POOL_ID,
  ClientId: process.env.COGNITO_CLIENT_ID,
};

// S3 Bucket Configuration
const S3_CONFIG = {
  BUCKET_NAME: process.env.S3_BUCKET_NAME || 'skillswap-uploads',
  REGION: process.env.AWS_REGION || 'us-east-1',
};

// Database Type Configuration
const DB_CONFIG = {
  TYPE: process.env.DB_TYPE || 'file', // 'dynamodb' or 'file'
  USE_DYNAMODB: process.env.DB_TYPE === 'dynamodb',
};

module.exports = {
  dynamoDb,
  dynamoDBClient,
  s3Client,
  cognitoClient,
  TABLES,
  COGNITO_CONFIG,
  S3_CONFIG,
  DB_CONFIG,
  awsConfig,
}; 