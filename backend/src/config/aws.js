// Legacy AWS config - use aws-v3.js for new development
// const AWS = require('aws-sdk');
require('dotenv').config();

// AWS.config.update({
//   region: process.env.AWS_REGION || 'us-east-1',
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   sessionToken: process.env.AWS_SESSION_TOKEN, // For temporary credentials
// });

// DynamoDB Configuration - LEGACY - use aws-v3.js instead
// const dynamoDb = new AWS.DynamoDB.DocumentClient({
//   region: process.env.AWS_REGION || 'us-east-1',
// });

// Cognito Configuration - LEGACY
// const cognito = new AWS.CognitoIdentityServiceProvider({
//   region: process.env.AWS_REGION || 'us-east-1',
// });

// S3 Configuration (for file uploads) - LEGACY
// const s3 = new AWS.S3({
//   region: process.env.AWS_REGION || 'us-east-1',
// });

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

module.exports = {
  // Legacy exports - use aws-v3.js for new development
  // AWS,
  // dynamoDb,
  // cognito,
  // s3,
  TABLES,
  COGNITO_CONFIG,
  S3_CONFIG,
}; 