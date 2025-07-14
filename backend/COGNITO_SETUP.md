# 🔐 AWS Cognito Authentication Setup Guide

## 📋 Overview

This guide helps you transition from **development bypass mode** to **real AWS Cognito authentication** in your SkillSwap application.

## 🏗️ Current Architecture

### ✅ What's Already Implemented
- **AWS SDK v3** - Modern Cognito client setup
- **JWT Token Verification** - JWKS-based validation
- **Development Bypass Mode** - For local testing
- **User Synchronization** - Between Cognito and DynamoDB
- **Frontend Integration** - AWS Amplify with Cognito

### 🔄 Authentication Modes

#### 🔧 Development Mode (Current)
```bash
BYPASS_AUTH=true
```
- Uses mock user for development
- No real AWS API calls
- Perfect for local development

#### 🔐 Production Mode  
```bash
BYPASS_AUTH=false
```
- Real Cognito JWT verification
- JWKS key validation
- Production-ready security

## ⚙️ Environment Configuration

### 1. **Create Environment File**

Create a `.env` file in the `backend/` directory:

```bash
# =================================
# 🚀 SkillSwap AWS Configuration
# =================================

# Server Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# =================================
# 🔐 AWS Authentication & Region
# =================================
AWS_REGION=eu-north-1
# For local development, use AWS CLI credentials:
# aws configure
# OR set these manually:
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key

# =================================
# 👤 AWS Cognito Authentication
# =================================
COGNITO_USER_POOL_ID=eu-north-1_tr3nTK4VG
COGNITO_CLIENT_ID=5heee4rhh886sa7nl4gqerqa2e
COGNITO_REGION=eu-north-1

# Authentication Mode
BYPASS_AUTH=false  # Set to 'false' for real Cognito

# =================================
# 🗄️ Database Configuration
# =================================
DB_TYPE=file  # 'file' for local, 'dynamodb' for production

# =================================
# 📁 File Storage Configuration
# =================================
STORAGE_TYPE=local  # 'local' for development, 's3' for production

# =================================
# 🔒 Security Configuration
# =================================
JWT_SECRET=your-secure-jwt-secret
CORS_ORIGIN=http://localhost:5173
```

### 2. **AWS Credentials Setup**

Choose one method:

#### Option A: AWS CLI (Recommended)
```bash
# Install AWS CLI and configure
aws configure
# Enter your AWS Access Key ID, Secret, and region
```

#### Option B: Environment Variables
```bash
export AWS_ACCESS_KEY_ID=your_access_key_here
export AWS_SECRET_ACCESS_KEY=your_secret_key_here
export AWS_REGION=eu-north-1
```

#### Option C: IAM Roles (Production)
- Use IAM roles when deploying to EC2/Lambda
- No need for hardcoded credentials

## 🧪 Testing the Setup

### 1. **Test Configuration**
```bash
npm run test-cognito
```

### 2. **Test Bypass Mode**
```bash
npm run dev:bypass
# or
BYPASS_AUTH=true npm run dev
```

### 3. **Test Real Cognito**
```bash
npm run dev:cognito  
# or
BYPASS_AUTH=false npm run dev
```

## 🔄 Migration Steps

### Step 1: Development Testing
1. Keep `BYPASS_AUTH=true` for development
2. Test all features work in bypass mode
3. Verify frontend authentication flow

### Step 2: Real Cognito Testing
1. Set `BYPASS_AUTH=false`
2. Configure AWS credentials
3. Test user registration and login
4. Verify JWT token validation

### Step 3: Production Deployment
1. Deploy with `BYPASS_AUTH=false`
2. Use IAM roles for credentials
3. Monitor authentication performance

## 🚀 NPM Scripts

```bash
# Development with bypass (default)
npm run dev              # Bypass mode enabled
npm run dev:bypass       # Explicit bypass mode

# Development with real Cognito
npm run dev:cognito      # Real Cognito authentication

# Testing
npm run test-cognito     # Test Cognito configuration

# Production
npm start               # Uses .env configuration
```

## 🔍 Troubleshooting

### ❌ "Missing AWS credentials"
```bash
# Solution: Configure AWS CLI
aws configure

# Or set environment variables
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
```

### ❌ "Token verification failed"
- Check User Pool ID and Client ID
- Verify JWKS URL is accessible
- Ensure token is from correct Cognito pool

### ❌ "CORS error"
- Update CORS_ORIGIN in .env
- Check frontend URL matches

### ❌ "User not found in database"
- User exists in Cognito but not in DynamoDB
- Automatic sync will create user profile
- Or manually run user sync

## 🛡️ Security Best Practices

### Development
- ✅ Use bypass mode for local development
- ✅ Never commit AWS credentials to git
- ✅ Use AWS CLI for credential management

### Production
- ✅ Use IAM roles instead of access keys
- ✅ Set `BYPASS_AUTH=false`
- ✅ Monitor JWT token expiration
- ✅ Implement proper error handling

## 📊 Monitoring

### Authentication Logs
```bash
# Check server logs for:
# ✅ Token verified successfully
# ❌ Token verification failed
# 🔧 Development bypass mode active
# 🔐 Production Cognito mode ENABLED
```

### Performance Metrics
- JWT verification time
- JWKS key cache hits
- Authentication success rate

## 🎯 Next Steps

1. **✅ Cognito Migration** - Complete (this guide)
2. **⏳ AWS Deployment** - Deploy to production
3. **⏳ CI/CD Pipeline** - Automated deployments
4. **⏳ Monitoring** - CloudWatch integration

## 📞 Support

If you encounter issues:
1. Run `npm run test-cognito` for diagnostics
2. Check AWS CloudTrail for API call logs
3. Verify Cognito User Pool configuration
4. Test with AWS CLI: `aws cognito-idp list-users --user-pool-id eu-north-1_tr3nTK4VG` 