# 🚀 SkillSwap Setup Guide

This guide will help you set up all the necessary AWS services and database configurations to make your SkillSwap application fully functional.

## 📋 Prerequisites

- AWS Account with appropriate permissions
- Node.js and npm installed
- Git installed

## 🔧 Step-by-Step Setup

### 1. **AWS Cognito Setup (Authentication)**

#### Create User Pool:
1. Go to AWS Console → Cognito → User Pools
2. Click "Create user pool"
3. Configure sign-in options:
   - ✅ Email
   - ✅ Username (optional)
4. Configure security requirements:
   - Password policy: Minimum 8 characters
   - MFA: Optional (recommended for production)
5. Configure sign-up experience:
   - ✅ Enable self-registration
   - Required attributes: `email`, `name`
6. Configure message delivery:
   - ✅ Send email with Cognito
7. Integrate your app:
   - User pool name: `skillswap-users`
   - App client name: `skillswap-web-client`
   - ✅ Generate a client secret: **NO** (for web apps)
8. Review and create

#### Get Your Credentials:
```bash
# Note down these values:
User Pool ID: us-east-1_XXXXXXXXX
App Client ID: XXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 2. **Database Setup (Choose One Option)**

#### Option A: DynamoDB (Recommended for AWS)

1. **Create Tables:**
   ```bash
   # Users Table
   aws dynamodb create-table \
     --table-name skillswap-users \
     --attribute-definitions \
       AttributeName=id,AttributeType=S \
     --key-schema \
       AttributeName=id,KeyType=HASH \
     --billing-mode PAY_PER_REQUEST

   # Skills Table
   aws dynamodb create-table \
     --table-name skillswap-skills \
     --attribute-definitions \
       AttributeName=id,AttributeType=S \
       AttributeName=userId,AttributeType=S \
     --key-schema \
       AttributeName=id,KeyType=HASH \
     --global-secondary-indexes \
       IndexName=UserIdIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL} \
     --billing-mode PAY_PER_REQUEST

   # Matches Table
   aws dynamodb create-table \
     --table-name skillswap-matches \
     --attribute-definitions \
       AttributeName=id,AttributeType=S \
     --key-schema \
       AttributeName=id,KeyType=HASH \
     --billing-mode PAY_PER_REQUEST

   # Messages Table
   aws dynamodb create-table \
     --table-name skillswap-messages \
     --attribute-definitions \
       AttributeName=id,AttributeType=S \
       AttributeName=matchId,AttributeType=S \
     --key-schema \
       AttributeName=id,KeyType=HASH \
     --global-secondary-indexes \
       IndexName=MatchIdIndex,KeySchema=[{AttributeName=matchId,KeyType=HASH}],Projection={ProjectionType=ALL} \
     --billing-mode PAY_PER_REQUEST
   ```

#### Option B: MongoDB

1. **Install MongoDB locally:**
   ```bash
   # macOS
   brew install mongodb-community
   brew services start mongodb-community

   # Or use MongoDB Atlas (cloud)
   # Sign up at https://cloud.mongodb.com
   ```

2. **Create database:**
   ```bash
   mongosh
   use skillswap
   # MongoDB will create collections automatically
   ```

#### Option C: PostgreSQL

1. **Install PostgreSQL:**
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql

   # Create database
   createdb skillswap
   ```

2. **Create tables:**
   ```sql
   -- Run these SQL commands in your PostgreSQL client
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     email VARCHAR(255) UNIQUE NOT NULL,
     name VARCHAR(255) NOT NULL,
     bio TEXT,
     skills_offered TEXT[],
     skills_wanted TEXT[],
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE matches (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user1_id UUID REFERENCES users(id),
     user2_id UUID REFERENCES users(id),
     status VARCHAR(50) DEFAULT 'pending',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE messages (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     match_id UUID REFERENCES matches(id),
     sender_id UUID REFERENCES users(id),
     content TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

### 3. **S3 Setup (File Storage)**

1. **Create S3 Bucket:**
   ```bash
   aws s3 mb s3://skillswap-storage-bucket --region us-east-1
   ```

2. **Configure CORS:**
   ```bash
   aws s3api put-bucket-cors \
     --bucket skillswap-storage-bucket \
     --cors-configuration file://cors-config.json
   ```

   Create `cors-config.json`:
   ```json
   {
     "CORSRules": [
       {
         "AllowedHeaders": ["*"],
         "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
         "AllowedOrigins": ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
         "ExposeHeaders": []
       }
     ]
   }
   ```

### 4. **Environment Configuration**

#### Frontend (.env.local):
```bash
# Copy the example file
cp frontend/.env.example frontend/.env.local

# Edit with your actual values
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOLS_ID=us-east-1_XXXXXXXXX
VITE_AWS_USER_POOLS_WEB_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_AWS_S3_BUCKET=skillswap-storage-bucket
VITE_API_BASE_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

#### Backend (.env):
```bash
# Copy the example file
cp backend/.env.example backend/.env

# Edit with your actual values
PORT=3000
NODE_ENV=development
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX

# Choose your database option:
# For DynamoDB:
DYNAMODB_TABLE_USERS=skillswap-users
DYNAMODB_TABLE_SKILLS=skillswap-skills
DYNAMODB_TABLE_MATCHES=skillswap-matches
DYNAMODB_TABLE_MESSAGES=skillswap-messages

# For MongoDB:
MONGODB_URI=mongodb://localhost:27017/skillswap

# For PostgreSQL:
DATABASE_URL=postgresql://username:password@localhost:5432/skillswap

JWT_SECRET=your-super-secret-jwt-key-here
S3_BUCKET_NAME=skillswap-storage-bucket
```

### 5. **Install Dependencies**

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 6. **Start the Application**

```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

## 🔐 Security Best Practices

1. **Never commit .env files** - They're already in .gitignore
2. **Use IAM roles** instead of access keys when possible
3. **Enable MFA** for production Cognito setup
4. **Use HTTPS** in production
5. **Implement rate limiting** (already configured)
6. **Regular security audits** with `npm audit`

## 🚀 Deployment Options

### AWS Deployment:
- **Frontend**: AWS Amplify or S3 + CloudFront
- **Backend**: AWS Lambda + API Gateway or EC2
- **Database**: DynamoDB or RDS

### Alternative Deployment:
- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, Heroku
- **Database**: MongoDB Atlas, PlanetScale

## 🆘 Troubleshooting

### Common Issues:

1. **CORS Errors**: Check your S3 CORS configuration
2. **Authentication Errors**: Verify Cognito User Pool ID and Client ID
3. **Database Connection**: Check your database credentials and network access
4. **Port Conflicts**: Change ports in .env files if needed

### Getting Help:
- Check AWS CloudWatch logs for backend errors
- Use browser dev tools for frontend debugging
- Verify environment variables are loaded correctly

## 📚 Additional Resources

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
- [React + AWS Amplify Guide](https://docs.amplify.aws/)

---

**Need help?** Create an issue in the repository or check the AWS documentation for specific service configuration details. 