# 🚀 SkillSwap AWS Deployment Guide

## 📋 Overview

This guide will help you deploy your **SkillSwap** application to AWS using:
- **AWS Amplify** - Frontend hosting (React)
- **AWS Lambda** - Backend API (Node.js/Express)
- **AWS DynamoDB** - Database
- **AWS S3** - File storage
- **AWS Cognito** - Authentication

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │───▶│   API Gateway    │───▶│  Lambda Function │
│  (AWS Amplify)  │    │   (REST API)     │    │   (Express.js)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                                                │
         │                                                ▼
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │   AWS Cognito   │    │   DynamoDB      │
         └─────────────▶│ (Authentication)│    │  (Database)     │
                        └─────────────────┘    └─────────────────┘
                                                        │
                        ┌─────────────────┐            │
                        │      AWS S3     │◀───────────┘
                        │ (File Storage)  │
                        └─────────────────┘
```

## 🔧 Prerequisites

### 1. **AWS Account Setup**
- Active AWS account
- AWS CLI installed and configured
- Appropriate IAM permissions

### 2. **Tools Installation**
```bash
# AWS CLI
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Serverless Framework
npm install -g serverless@^3.0.0

# Amplify CLI
npm install -g @aws-amplify/cli
```

### 3. **Configure AWS CLI**
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key  
# Enter your region (e.g., eu-north-1)
# Enter output format (json)
```

## 🚀 Deployment Steps

### **STEP 1: Backend Deployment (AWS Lambda)**

#### 1.1 Prepare Environment
```bash
cd backend

# Create production environment file
cp .env.s3 .env.production

# Edit .env.production with your values:
# COGNITO_USER_POOL_ID=eu-north-1_tr3nTK4VG
# COGNITO_CLIENT_ID=5heee4rhh886sa7nl4gqerqa2e
# JWT_SECRET=your-secure-production-secret
# FRONTEND_URL=https://main.d1234567890.amplifyapp.com
```

#### 1.2 Deploy Backend
```bash
# Deploy to development stage
npx serverless deploy --stage dev

# Deploy to production stage
npx serverless deploy --stage prod --region eu-north-1
```

#### 1.3 Get API Endpoint
After deployment, note the API endpoint:
```
Service Information
service: skillswap-backend
stage: prod
region: eu-north-1

endpoints:
  ANY - https://abc123def.execute-api.eu-north-1.amazonaws.com/prod/{proxy+}
  ANY - https://abc123def.execute-api.eu-north-1.amazonaws.com/prod
```

#### 1.4 Test Backend Deployment
```bash
# Test health endpoint
curl https://abc123def.execute-api.eu-north-1.amazonaws.com/prod/health

# Expected response:
{
  "success": true,
  "message": "SkillSwap API is running",
  "environment": "prod",
  "services": {
    "database": "dynamodb",
    "storage": "s3",
    "auth": "cognito"
  }
}
```

### **STEP 2: Frontend Deployment (AWS Amplify)**

#### 2.1 Update Frontend Configuration
```bash
cd ../frontend

# Update src/aws-exports.js with production API URL
# You can keep existing Cognito settings
```

#### 2.2 Option A: Deploy via Amplify Console (Recommended)

1. **Go to AWS Amplify Console**
   - https://console.aws.amazon.com/amplify/

2. **Create New App**
   - Choose "Host web app"
   - Connect your GitHub repository
   - Select the `frontend` folder as root directory

3. **Configure Build Settings**
   ```yaml
   # This will be auto-detected from amplify.yml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

4. **Set Environment Variables**
   ```
   VITE_API_URL = https://abc123def.execute-api.eu-north-1.amazonaws.com/prod
   VITE_BYPASS_AUTH = false
   NODE_ENV = production
   ```

5. **Deploy**
   - Click "Save and Deploy"
   - Wait for build to complete (~2-3 minutes)

#### 2.2 Option B: Deploy via Amplify CLI

```bash
# Initialize Amplify project
amplify init

# Add hosting
amplify add hosting
# Choose "Amazon CloudFront and S3"

# Build and deploy
npm run build
amplify publish
```

#### 2.3 Get Frontend URL
After deployment, you'll get a URL like:
```
https://main.d1234567890.amplifyapp.com
```

### **STEP 3: Update Backend CORS**

Update your backend deployment with the actual frontend URL:

```bash
cd ../backend

# Update .env.production
FRONTEND_URL=https://main.d1234567890.amplifyapp.com
CORS_ORIGIN=https://main.d1234567890.amplifyapp.com

# Redeploy backend
npx serverless deploy --stage prod
```

### **STEP 4: Test Complete Deployment**

1. **Visit your frontend URL**
   ```
   https://main.d1234567890.amplifyapp.com
   ```

2. **Test Authentication**
   - Click "Sign In"
   - Create a new account
   - Verify email
   - Sign in successfully

3. **Test API Integration**
   - Update profile information
   - Upload profile photo
   - Browse other users
   - Send match requests

## 🔧 Advanced Configuration

### **Custom Domain (Optional)**

#### For Frontend (Amplify)
1. Go to Amplify Console
2. Select your app
3. Go to "Domain management"
4. Add your custom domain
5. Set up SSL certificate (automatic)

#### For Backend (API Gateway)
1. Go to API Gateway Console
2. Select your API
3. Go to "Custom domain names"
4. Create custom domain
5. Set up SSL certificate

### **Environment-Specific Deployments**

```bash
# Development environment
npx serverless deploy --stage dev

# Staging environment  
npx serverless deploy --stage staging

# Production environment
npx serverless deploy --stage prod
```

### **Monitoring & Logging**

#### CloudWatch Logs
```bash
# View Lambda logs
npx serverless logs -f api --stage prod

# Tail logs in real-time
npx serverless logs -f api --stage prod --tail
```

#### Custom Monitoring
- Set up CloudWatch alarms for errors
- Monitor API Gateway metrics
- Track DynamoDB performance
- S3 access logs

## 📊 Cost Optimization

### **AWS Free Tier Usage**
- **Lambda**: 1M requests/month free
- **API Gateway**: 1M API calls/month free
- **DynamoDB**: 25GB storage free
- **S3**: 5GB storage free
- **Amplify**: 1000 build minutes/month free

### **Production Cost Estimates**
- **Small app** (~1000 users): $10-30/month
- **Medium app** (~10k users): $50-150/month
- **Large app** (~100k users): $200-500/month

## 🔍 Troubleshooting

### **Common Issues**

#### 1. CORS Errors
```bash
# Check CORS configuration in serverless.yml
# Ensure FRONTEND_URL matches deployed URL
# Redeploy backend after URL changes
```

#### 2. Authentication Failures
```bash
# Check Cognito User Pool ID and Client ID
# Verify BYPASS_AUTH=false in production
# Test with aws cognito-idp list-users
```

#### 3. DynamoDB Errors
```bash
# Check IAM permissions in serverless.yml
# Verify table names match environment
# Check CloudWatch logs for detailed errors
```

#### 4. S3 Upload Issues
```bash
# Check bucket permissions
# Verify CORS configuration
# Check file size limits
```

### **Debug Commands**

```bash
# Test API endpoint
curl -X GET https://your-api-url/health

# Check Lambda logs
npx serverless logs -f api --stage prod

# List DynamoDB tables
aws dynamodb list-tables --region eu-north-1

# Check S3 buckets
aws s3 ls

# Test Cognito
aws cognito-idp list-users --user-pool-id eu-north-1_tr3nTK4VG
```

## 🚀 CI/CD Pipeline (Next Step)

After successful manual deployment, set up automated CI/CD:

1. **GitHub Actions** - Automated deployments on push
2. **AWS CodePipeline** - AWS-native CI/CD
3. **Branch-based deployments** - dev/staging/prod environments

## 📞 Support

### **Useful AWS Documentation**
- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/)
- [AWS Amplify User Guide](https://docs.aws.amazon.com/amplify/)
- [DynamoDB Developer Guide](https://docs.aws.amazon.com/dynamodb/)
- [Cognito Developer Guide](https://docs.aws.amazon.com/cognito/)

### **Community Resources**
- [Serverless Framework Docs](https://www.serverless.com/framework/docs/)
- [AWS Community Forums](https://forums.aws.amazon.com/)

## 🎉 Success Checklist

- ✅ Backend deployed to AWS Lambda
- ✅ Frontend deployed to AWS Amplify  
- ✅ Real AWS Cognito authentication working
- ✅ DynamoDB tables created and accessible
- ✅ S3 file storage configured
- ✅ CORS properly configured
- ✅ All features working end-to-end
- ✅ SSL certificates active
- ✅ Custom domain configured (optional)
- ✅ Monitoring and logging set up

**🎊 Congratulations! Your SkillSwap application is now live on AWS! 🎊** 