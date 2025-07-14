#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { setupTables } = require('../src/database/setup-v3');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { dynamoDb, TABLES } = require('../src/config/aws-v3');

const DATA_FILE = path.join(process.cwd(), 'data', 'users.json');

async function migrateUsersToDatabase() {
  console.log('🚀 Starting migration from JSON file to DynamoDB...\n');

  try {
    // Step 1: Setup DynamoDB tables
    console.log('📝 Step 1: Setting up DynamoDB tables...');
    await setupTables();
    console.log('✅ DynamoDB tables ready\n');

    // Step 2: Read existing data
    console.log('📂 Step 2: Reading existing user data...');
    let users = [];
    
    try {
      const data = await fs.readFile(DATA_FILE, 'utf8');
      users = JSON.parse(data);
      console.log(`📊 Found ${users.length} users in file storage\n`);
    } catch (error) {
      console.log('ℹ️  No existing user data file found. Starting fresh.\n');
      return;
    }

    if (users.length === 0) {
      console.log('ℹ️  No users to migrate.\n');
      return;
    }

    // Step 3: Migrate users to DynamoDB
    console.log('🔄 Step 3: Migrating users to DynamoDB...');
    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Ensure required fields exist
        const userItem = {
          userId: user.userId,
          email: user.email,
          name: user.name || '',
          bio: user.bio || '',
          location: user.location || '',
          profilePhoto: user.profilePhoto || null,
          skillsOffered: user.skillsOffered || [],
          skillsWanted: user.skillsWanted || [],
          rating: user.rating || 0,
          totalRatings: user.totalRatings || 0,
          isActive: user.isActive !== undefined ? user.isActive : true,
          createdAt: user.createdAt || new Date().toISOString(),
          updatedAt: user.updatedAt || new Date().toISOString()
        };

        const command = new PutCommand({
          TableName: TABLES.USERS,
          Item: userItem,
          ConditionExpression: 'attribute_not_exists(userId)' // Don't overwrite existing users
        });

        await dynamoDb.send(command);
        console.log(`✅ Migrated user: ${user.name || user.email} (${user.userId})`);
        successCount++;
      } catch (error) {
        if (error.name === 'ConditionalCheckFailedException') {
          console.log(`⚠️  User already exists in DynamoDB: ${user.name || user.email} (${user.userId})`);
        } else {
          console.error(`❌ Error migrating user ${user.userId}:`, error.message);
          errorCount++;
        }
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Successfully migrated: ${successCount} users`);
    console.log(`   ❌ Errors: ${errorCount} users`);
    console.log(`   📝 Total processed: ${users.length} users\n`);

    // Step 4: Backup original file
    if (successCount > 0) {
      const backupFile = DATA_FILE + '.backup.' + Date.now();
      await fs.copyFile(DATA_FILE, backupFile);
      console.log(`💾 Original file backed up to: ${backupFile}`);
    }

    console.log('\n🎉 Migration completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Set DB_TYPE=dynamodb in your environment variables');
    console.log('   2. Restart your application');
    console.log('   3. Verify data is working correctly');
    console.log('   4. Remove backup file when confident');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Helper function to verify migration
async function verifyMigration() {
  console.log('🔍 Verifying migration...');
  
  try {
    const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
    const command = new ScanCommand({
      TableName: TABLES.USERS,
      Select: 'COUNT'
    });
    
    const result = await dynamoDb.send(command);
    console.log(`✅ DynamoDB contains ${result.Count} users`);
    
    // Compare with file count
    try {
      const data = await fs.readFile(DATA_FILE, 'utf8');
      const users = JSON.parse(data);
      console.log(`📁 File storage contains ${users.length} users`);
      
      if (result.Count === users.length) {
        console.log('✅ User counts match! Migration appears successful.');
      } else {
        console.log('⚠️  User counts don\'t match. Please check migration.');
      }
    } catch (error) {
      console.log('📁 No file storage to compare against.');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--verify')) {
    await verifyMigration();
  } else if (args.includes('--help')) {
    console.log(`
🔧 DynamoDB Migration Tool

Usage:
  node migrate-to-dynamodb.js          # Run migration
  node migrate-to-dynamodb.js --verify # Verify migration
  node migrate-to-dynamodb.js --help   # Show this help

Environment Variables Required:
  AWS_REGION=us-east-1
  AWS_ACCESS_KEY_ID=your_access_key
  AWS_SECRET_ACCESS_KEY=your_secret_key
  USERS_TABLE=skillswap-users (optional, defaults used)
`);
  } else {
    await migrateUsersToDatabase();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = {
  migrateUsersToDatabase,
  verifyMigration
}; 