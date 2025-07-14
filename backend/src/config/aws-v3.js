/**
 * AWS SDK v3 Configuration for SkillSwap
 * Modern AWS configuration with Cognito, DynamoDB, and S3 support
 */

// AWS SDK v3 imports
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { S3Client } = require('@aws-sdk/client-s3');
const { CognitoIdentityProviderClient } = require('@aws-sdk/client-cognito-identity-provider');

require('dotenv').config();

// AWS Region Configuration
const AWS_REGION = process.env.AWS_REGION || 'eu-north-1';

// =================================
// 🔐 AWS Clients Configuration
// =================================

// DynamoDB Client (v3)
const dynamoDBClient = new DynamoDBClient({
  region: AWS_REGION,
  // In production, AWS SDK will automatically use IAM roles
  // In development, it will use AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY from .env
});

// DynamoDB Document Client (v3)
const dynamoDbDocClient = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    convertEmptyValues: false,
    removeUndefinedValues: true,
    convertClassInstanceToMap: false,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

// S3 Client (v3)
const s3Client = new S3Client({
  region: AWS_REGION,
});

// Cognito Identity Provider Client (v3)
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION || AWS_REGION,
});

// =================================
// 📊 Database Configuration
// =================================

// Database Configuration
const DB_CONFIG = {
  USE_DYNAMODB: process.env.DB_TYPE === 'dynamodb',
  USE_FILE_STORAGE: process.env.DB_TYPE === 'file' || !process.env.DB_TYPE,
};

// DynamoDB Table Names
const TABLES = {
  USERS: process.env.USERS_TABLE || 'skillswap-users',
  MATCHES: process.env.MATCHES_TABLE || 'skillswap-matches', 
  MESSAGES: process.env.MESSAGES_TABLE || 'skillswap-messages',
  RATINGS: process.env.RATINGS_TABLE || 'skillswap-ratings',
};

// =================================
// 👤 Cognito Configuration
// =================================

const COGNITO_CONFIG = {
  UserPoolId: process.env.COGNITO_USER_POOL_ID || 'eu-north-1_tr3nTK4VG',
  ClientId: process.env.COGNITO_CLIENT_ID || '5heee4rhh886sa7nl4gqerqa2e',
  Region: process.env.COGNITO_REGION || AWS_REGION,
  
  // JWKS URL for token verification
  get jwksUri() {
    return `https://cognito-idp.${this.Region}.amazonaws.com/${this.UserPoolId}/.well-known/jwks.json`;
  },
  
  // Token issuer URL
  get issuer() {
    return `https://cognito-idp.${this.Region}.amazonaws.com/${this.UserPoolId}`;
  }
};

// =================================
// 📁 S3 Configuration
// =================================

const S3_CONFIG = {
  BUCKET_NAME: process.env.S3_BUCKET_NAME || 'skillswap-files',
  REGION: process.env.S3_REGION || AWS_REGION,
  USE_S3: process.env.STORAGE_TYPE === 's3',
  USE_LOCAL: process.env.STORAGE_TYPE === 'local' || !process.env.STORAGE_TYPE,
};

// =================================
// 🔒 Authentication Configuration
// =================================

const AUTH_CONFIG = {
  BYPASS_MODE: process.env.BYPASS_AUTH === 'true' && process.env.NODE_ENV === 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
};

// =================================
// 🚀 Export Configuration
// =================================

module.exports = {
  // AWS Clients (v3)
  dynamoDBClient,
  dynamoDbDocClient,
  s3Client,
  cognitoClient,
  
  // Configuration Objects
  DB_CONFIG,
  TABLES,
  COGNITO_CONFIG,
  S3_CONFIG,
  AUTH_CONFIG,
  
  // Constants
  AWS_REGION,
  
  // Legacy support (for gradual migration)
  dynamoDb: dynamoDbDocClient, // Alias for backward compatibility
}; 