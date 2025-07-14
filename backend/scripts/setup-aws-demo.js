#!/usr/bin/env node

/**
 * AWS DynamoDB Demo Setup Script
 * 
 * This script demonstrates the DynamoDB migration process.
 * For production use, you'll need real AWS credentials.
 */

const fs = require('fs').promises;
const path = require('path');

async function createDemoEnvironment() {
  console.log('🚀 Setting up DynamoDB Migration Demo\n');

  try {
    // Create a demo environment configuration
    const demoEnvContent = `# SkillSwap Backend - DynamoDB Configuration
# Copy this file to .env and update with your AWS credentials

# Database Configuration
DB_TYPE=dynamodb
# DB_TYPE=file  # Use this for file storage (current mode)

# AWS Configuration (Required for DynamoDB)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here

# DynamoDB Table Names
USERS_TABLE=skillswap-users-dev
SKILLS_TABLE=skillswap-skills-dev
MATCHES_TABLE=skillswap-matches-dev
MESSAGES_TABLE=skillswap-messages-dev
RATINGS_TABLE=skillswap-ratings-dev

# Application Settings
NODE_ENV=development
PORT=3000
BYPASS_AUTH=true

# For production, also configure:
# COGNITO_USER_POOL_ID=your_user_pool_id
# COGNITO_CLIENT_ID=your_client_id
# S3_BUCKET_NAME=skillswap-uploads`;

    // Write demo environment file
    const envDemoPath = path.join(process.cwd(), '.env.demo');
    await fs.writeFile(envDemoPath, demoEnvContent);
    console.log(`✅ Created demo environment file: ${envDemoPath}`);

    // Create migration guide
    const migrationGuide = `# 🚀 DynamoDB Migration Guide

## Current Status
- ✅ File storage working (JSON-based)
- ✅ AWS SDK v3 installed
- ✅ DynamoDB service layer ready
- ✅ Migration scripts prepared

## Step-by-Step Migration Process

### 1. AWS Account Setup
\`\`\`bash
# Set up AWS credentials (choose one method):

# Option A: AWS CLI
aws configure

# Option B: Environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1

# Option C: Create .env file
cp .env.demo .env
# Edit .env with your AWS credentials
\`\`\`

### 2. Create DynamoDB Tables
\`\`\`bash
# Create all required DynamoDB tables
npm run setup-db-v3
\`\`\`

### 3. Migrate Existing Data
\`\`\`bash
# Migrate your current user data to DynamoDB
npm run migrate-to-dynamodb

# Verify the migration was successful
npm run verify-migration
\`\`\`

### 4. Switch to DynamoDB
\`\`\`bash
# Update your environment configuration
echo "DB_TYPE=dynamodb" >> .env

# Restart the application
npm run dev
\`\`\`

### 5. Verify Everything Works
- ✅ Check user profiles load correctly
- ✅ Test creating/updating profiles
- ✅ Verify skill management works
- ✅ Check matches functionality

## Benefits After Migration

🎯 **Production Ready**: Real database instead of JSON files
⚡ **Scalable**: Handle thousands of users
🔒 **Reliable**: AWS-managed infrastructure
🚀 **Fast**: Optimized NoSQL queries
💰 **Cost Effective**: Pay-per-request pricing
🔧 **Foundation**: Ready for other AWS services

## Cost Estimate
- **Development**: ~$0-5/month (free tier eligible)
- **Production**: ~$10-50/month (depending on usage)

## Next AWS Services (After DynamoDB)
1. 🗄️  **DynamoDB** ← (You are here)
2. 📁 **S3** - File uploads
3. 🔐 **Cognito** - Authentication
4. ⚡ **Lambda** - Serverless functions
5. 🌐 **API Gateway** - API management
6. 📊 **CloudWatch** - Monitoring
`;

    const guidePath = path.join(process.cwd(), 'DYNAMODB_MIGRATION_GUIDE.md');
    await fs.writeFile(guidePath, migrationGuide);
    console.log(`✅ Created migration guide: ${guidePath}`);

    console.log('\n🎉 Demo setup completed!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Read DYNAMODB_MIGRATION_GUIDE.md');
    console.log('   2. Set up your AWS credentials');
    console.log('   3. Run the migration when ready');

  } catch (error) {
    console.error('❌ Demo setup failed:', error);
    process.exit(1);
  }
}

// Helper to show current configuration
async function showCurrentConfig() {
  console.log('📊 Current SkillSwap Configuration\n');
  
  // Check current DB_TYPE
  const dbType = process.env.DB_TYPE || 'file';
  console.log(`🗄️  Database Type: ${dbType}`);
  
  if (dbType === 'dynamodb') {
    console.log('✅ Using DynamoDB (Production Ready!)');
    console.log(`📍 AWS Region: ${process.env.AWS_REGION || 'us-east-1'}`);
    console.log(`📋 Users Table: ${process.env.USERS_TABLE || 'skillswap-users'}`);
  } else {
    console.log('📁 Using File Storage (Development Mode)');
    
    // Check if user data exists
    try {
      const dataFile = path.join(process.cwd(), 'data', 'users.json');
      const data = await fs.readFile(dataFile, 'utf8');
      const users = JSON.parse(data);
      console.log(`👥 Current Users: ${users.length}`);
    } catch (error) {
      console.log('👥 Current Users: 0 (no data file)');
    }
  }
  
  console.log('\n🔧 Available Commands:');
  console.log('   npm run setup-db-v3        # Setup DynamoDB tables');
  console.log('   npm run migrate-to-dynamodb # Migrate to DynamoDB');
  console.log('   npm run verify-migration    # Verify migration');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--status')) {
    await showCurrentConfig();
  } else if (args.includes('--help')) {
    console.log(`
🔧 AWS DynamoDB Demo Setup

Usage:
  node setup-aws-demo.js           # Create demo environment
  node setup-aws-demo.js --status  # Show current configuration
  node setup-aws-demo.js --help    # Show this help
`);
  } else {
    await createDemoEnvironment();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
} 