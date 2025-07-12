# SkillSwap - AWS Full-Stack Application

A skill-sharing platform where users can offer and request skills, match with others, and build a learning community.

## 🏗️ Architecture

- **Frontend**: React + Tailwind CSS (AWS Amplify Hosting)
- **Backend**: Node.js + Express.js (AWS Amplify Functions)
- **Database**: AWS DynamoDB
- **Authentication**: AWS Cognito
- **File Storage**: AWS S3
- **CI/CD**: AWS Amplify CI/CD Pipeline
- **Hosting**: AWS Amplify

## 🚀 AWS Setup Guide

### 1. Prerequisites
- AWS Account (free tier)
- Node.js (v18+)
- npm or yarn
- Git
- AWS CLI installed

### 2. AWS IAM Setup
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI
aws configure
```

**Required IAM Permissions:**
- AmplifyFullAccess
- AmazonDynamoDBFullAccess
- AmazonS3FullAccess
- AmazonCognitoPowerUser

### 3. Project Setup
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure Amplify
amplify configure

# Clone and setup project
git clone <your-repo>
cd skillswap
npm install
```

### 4. AWS Services Configuration

#### DynamoDB Tables
- **Users**: User profiles, skills offered/wanted
- **Matches**: User connections and skill matches
- **Messages**: Chat messages between users
- **Ratings**: User ratings and feedback

#### Amplify Configuration
```bash
# Initialize Amplify
amplify init

# Add authentication
amplify add auth

# Add API (GraphQL)
amplify add api

# Add storage
amplify add storage

# Deploy backend
amplify push
```

## 🏃‍♂️ Local Development

```bash
# Start frontend
npm run dev

# Start backend (if running separately)
npm run server

# Run tests
npm test
```

## 🚀 Deployment

### Automatic Deployment (CI/CD)
1. Push code to GitHub
2. AWS Amplify automatically deploys
3. Frontend and backend deployed together

### Manual Deployment
```bash
# Deploy everything
amplify publish

# Deploy backend only
amplify push

# Deploy frontend only
amplify hosting add
```

## 📊 Database Schema

### Users Table
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "skillsOffered": ["string"],
  "skillsWanted": ["string"],
  "bio": "string",
  "location": "string",
  "rating": "number",
  "createdAt": "timestamp"
}
```

### Matches Table
```json
{
  "id": "string",
  "userId1": "string",
  "userId2": "string",
  "skill": "string",
  "status": "pending|accepted|declined",
  "createdAt": "timestamp"
}
```

## 🔧 Environment Variables

Create `.env` file:
```env
REACT_APP_AWS_REGION=us-east-1
REACT_APP_AWS_COGNITO_USER_POOL_ID=your-user-pool-id
REACT_APP_AWS_COGNITO_CLIENT_ID=your-client-id
REACT_APP_API_URL=your-api-url
```

## 🎯 Features

- [x] User authentication (Cognito)
- [x] Profile management
- [x] Skill matching algorithm
- [x] Real-time chat
- [x] Rating system
- [x] Responsive design
- [x] CI/CD pipeline

## 🧪 Testing

```bash
# Run all tests
npm test

# Run frontend tests
npm run test:frontend

# Run backend tests
npm run test:backend
```

## 📚 Learning Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [DynamoDB Guide](https://docs.aws.amazon.com/dynamodb/)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/) 