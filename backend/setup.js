#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

console.log('🚀 SkillSwap Backend Setup Script');
console.log('===================================');

// Environment template
const envTemplate = `# Node.js Environment
NODE_ENV=development
PORT=3000

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

# AWS Cognito Configuration
COGNITO_USER_POOL_ID=your_user_pool_id
COGNITO_CLIENT_ID=your_client_id

# DynamoDB Table Names
USERS_TABLE=skillswap-users
SKILLS_TABLE=skillswap-skills
MATCHES_TABLE=skillswap-matches
MESSAGES_TABLE=skillswap-messages
RATINGS_TABLE=skillswap-ratings

# S3 Configuration
S3_BUCKET_NAME=skillswap-uploads

# Development Settings
BYPASS_AUTH=true
DEBUG=true

# Socket.IO Configuration
SOCKET_IO_CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

async function setupEnvironment() {
  console.log('\n📋 Setting up environment variables...');
  
  const envPath = path.join(__dirname, '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists. Skipping...');
    return;
  }
  
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env file with default values');
  console.log('📝 Please edit .env file with your AWS credentials');
}

async function installDependencies() {
  console.log('\n📦 Installing dependencies...');
  
  try {
    await execAsync('npm install');
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Error installing dependencies:', error.message);
    process.exit(1);
  }
}

async function setupDatabase() {
  console.log('\n🗄️  Setting up DynamoDB tables...');
  
  try {
    const { setupTables } = require('./src/database/setup');
    await setupTables();
    console.log('✅ DynamoDB tables created successfully');
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.log('💡 Make sure your AWS credentials are configured correctly');
    console.log('💡 You can run "npm run setup-db" later to retry');
  }
}

async function displayNextSteps() {
  console.log('\n🎉 Setup Complete!');
  console.log('==================');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Edit the .env file with your AWS credentials');
  console.log('2. Set up AWS Cognito User Pool and get the IDs');
  console.log('3. Create DynamoDB tables: npm run setup-db');
  console.log('4. Start the development server: npm run dev');
  console.log('');
  console.log('🔧 AWS Setup Guide:');
  console.log('1. Create AWS Cognito User Pool');
  console.log('2. Create DynamoDB tables');
  console.log('3. Set up IAM permissions');
  console.log('4. Configure CORS settings');
  console.log('');
  console.log('📚 Documentation:');
  console.log('- AWS Cognito: https://docs.aws.amazon.com/cognito/');
  console.log('- DynamoDB: https://docs.aws.amazon.com/dynamodb/');
  console.log('- IAM: https://docs.aws.amazon.com/iam/');
  console.log('');
  console.log('🚀 Ready to start coding!');
}

async function main() {
  try {
    await setupEnvironment();
    await installDependencies();
    
    // Skip database setup in CI/CD or if AWS credentials are not configured
    if (process.env.NODE_ENV !== 'test' && !process.env.CI) {
      await setupDatabase();
    }
    
    await displayNextSteps();
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  main();
}

module.exports = { setupEnvironment, installDependencies, setupDatabase }; 