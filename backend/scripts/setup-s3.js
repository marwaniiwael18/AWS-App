#!/usr/bin/env node

const { S3Client, CreateBucketCommand, PutBucketCorsCommand, PutBucketPolicyCommand, HeadBucketCommand, GetBucketPolicyCommand } = require('@aws-sdk/client-s3');
const { s3Client, S3_CONFIG } = require('../src/config/aws-v3');
const fs = require('fs').promises;
const path = require('path');

class S3Setup {
  constructor() {
    this.bucketName = S3_CONFIG.BUCKET_NAME;
    this.region = S3_CONFIG.REGION;
  }

  // Check if bucket exists
  async bucketExists() {
    try {
      const command = new HeadBucketCommand({ Bucket: this.bucketName });
      await s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  // Create S3 bucket
  async createBucket() {
    try {
      console.log(`📝 Creating S3 bucket: ${this.bucketName}...`);
      
      const createParams = {
        Bucket: this.bucketName
      };

      // Add location constraint if not in us-east-1
      if (this.region !== 'us-east-1') {
        createParams.CreateBucketConfiguration = {
          LocationConstraint: this.region
        };
      }

      const command = new CreateBucketCommand(createParams);
      const result = await s3Client.send(command);
      
      console.log(`✅ S3 bucket created: ${this.bucketName}`);
      return result;
    } catch (error) {
      if (error.name === 'BucketAlreadyOwnedByYou') {
        console.log(`ℹ️  Bucket already exists and is owned by you: ${this.bucketName}`);
        return { alreadyExists: true };
      } else if (error.name === 'BucketAlreadyExists') {
        throw new Error(`Bucket name ${this.bucketName} is already taken. Please choose a different name.`);
      } else {
        console.error(`❌ Error creating bucket:`, error);
        throw error;
      }
    }
  }

  // Configure CORS for the bucket
  async configureCORS() {
    try {
      console.log(`🔧 Configuring CORS for bucket: ${this.bucketName}...`);
      
      const corsConfiguration = {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            AllowedOrigins: [
              'http://localhost:3000',
              'http://localhost:5173',
              'http://localhost:5174',
              'https://localhost:3000',
              'https://localhost:5173',
              'https://localhost:5174'
            ],
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 3000
          },
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET'],
            AllowedOrigins: ['*'],
            MaxAgeSeconds: 3000
          }
        ]
      };

      const command = new PutBucketCorsCommand({
        Bucket: this.bucketName,
        CORSConfiguration: corsConfiguration
      });

      await s3Client.send(command);
      console.log(`✅ CORS configured for bucket: ${this.bucketName}`);
    } catch (error) {
      console.error(`❌ Error configuring CORS:`, error);
      throw error;
    }
  }

  // Configure bucket policy for public read access
  async configureBucketPolicy() {
    try {
      console.log(`🔒 Configuring bucket policy for: ${this.bucketName}...`);
      
      const bucketPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicReadGetObject',
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: `arn:aws:s3:::${this.bucketName}/profiles/*`
          },
          {
            Sid: 'PublicReadGetObject2', 
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: `arn:aws:s3:::${this.bucketName}/uploads/*`
          }
        ]
      };

      const command = new PutBucketPolicyCommand({
        Bucket: this.bucketName,
        Policy: JSON.stringify(bucketPolicy)
      });

      await s3Client.send(command);
      console.log(`✅ Bucket policy configured for: ${this.bucketName}`);
    } catch (error) {
      console.error(`❌ Error configuring bucket policy:`, error);
      throw error;
    }
  }

  // Setup complete S3 configuration
  async setupS3() {
    console.log('🚀 Setting up S3 for SkillSwap...\n');
    console.log(`📍 Region: ${this.region}`);
    console.log(`🪣 Bucket: ${this.bucketName}\n`);

    try {
      // Check if bucket exists
      const exists = await this.bucketExists();
      
      if (!exists) {
        // Create bucket
        await this.createBucket();
        
        // Wait a bit for bucket to be ready
        console.log('⏳ Waiting for bucket to be ready...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.log(`ℹ️  Bucket already exists: ${this.bucketName}`);
      }

      // Configure CORS
      await this.configureCORS();
      
      // Configure bucket policy for public read
      await this.configureBucketPolicy();

      console.log('\n🎉 S3 setup completed successfully!');
      console.log('\n📋 Next Steps:');
      console.log('   1. Set STORAGE_TYPE=s3 in your environment');
      console.log('   2. Restart your application');
      console.log('   3. Test file uploads');
      
      console.log('\n🔗 Bucket URLs:');
      console.log(`   Console: https://s3.console.aws.amazon.com/s3/buckets/${this.bucketName}`);
      console.log(`   Public URL: https://${this.bucketName}.s3.${this.region}.amazonaws.com/`);

    } catch (error) {
      console.error('\n❌ S3 setup failed:', error.message);
      throw error;
    }
  }

  // Verify S3 setup
  async verifySetup() {
    console.log('🔍 Verifying S3 setup...\n');
    
    try {
      // Check bucket exists
      const exists = await this.bucketExists();
      if (exists) {
        console.log(`✅ Bucket exists: ${this.bucketName}`);
      } else {
        console.log(`❌ Bucket not found: ${this.bucketName}`);
        return false;
      }

      // Check bucket policy
      try {
        const policyCommand = new GetBucketPolicyCommand({ Bucket: this.bucketName });
        const policyResult = await s3Client.send(policyCommand);
        console.log(`✅ Bucket policy configured`);
      } catch (error) {
        if (error.name === 'NoSuchBucketPolicy') {
          console.log(`⚠️  No bucket policy found`);
        } else {
          console.log(`❌ Error checking bucket policy: ${error.message}`);
        }
      }

      console.log('\n📊 S3 Configuration Summary:');
      console.log(`   Bucket Name: ${this.bucketName}`);
      console.log(`   Region: ${this.region}`);
      console.log(`   Status: Ready for use`);
      
      return true;
    } catch (error) {
      console.error('\n❌ Verification failed:', error.message);
      return false;
    }
  }

  // Clean up S3 resources (for testing)
  async cleanup() {
    console.log('🧹 This would delete the S3 bucket and all contents...');
    console.log('⚠️  For safety, manual deletion is required.');
    console.log(`   Go to: https://s3.console.aws.amazon.com/s3/buckets/${this.bucketName}`);
  }
}

// Create demo environment file for S3
async function createS3DemoConfig() {
  const demoEnvContent = `# SkillSwap Backend - S3 Configuration
# Add these to your .env file

# Storage Configuration
STORAGE_TYPE=s3
# STORAGE_TYPE=local  # Use this for local storage (current mode)

# AWS S3 Configuration
S3_BUCKET_NAME=skillswap-uploads-${Date.now()}
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here

# Database (if not already configured)
DB_TYPE=file
# DB_TYPE=dynamodb

# Application Settings
NODE_ENV=development
PORT=3000
BYPASS_AUTH=true`;

  const envS3Path = path.join(process.cwd(), '.env.s3');
  await fs.writeFile(envS3Path, demoEnvContent);
  console.log(`✅ Created S3 demo config: ${envS3Path}`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const s3Setup = new S3Setup();
  
  try {
    if (args.includes('--verify')) {
      await s3Setup.verifySetup();
    } else if (args.includes('--cleanup')) {
      await s3Setup.cleanup();
    } else if (args.includes('--demo-config')) {
      await createS3DemoConfig();
    } else if (args.includes('--help')) {
      console.log(`
🔧 S3 Setup Tool for SkillSwap

Usage:
  node setup-s3.js                # Setup S3 bucket
  node setup-s3.js --verify       # Verify S3 setup
  node setup-s3.js --demo-config  # Create demo .env.s3 file
  node setup-s3.js --cleanup      # Instructions to cleanup
  node setup-s3.js --help         # Show this help

Environment Variables Required:
  AWS_REGION=us-east-1
  AWS_ACCESS_KEY_ID=your_access_key
  AWS_SECRET_ACCESS_KEY=your_secret_key
  S3_BUCKET_NAME=your-unique-bucket-name

Cost Information:
  - S3 Storage: $0.023/GB/month (first 50TB)
  - Requests: $0.0004/1000 PUT, $0.0004/10000 GET
  - Data Transfer: First 1GB/month free
  - Development usage: ~$0-2/month
`);
    } else {
      await s3Setup.setupS3();
    }
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { S3Setup }; 