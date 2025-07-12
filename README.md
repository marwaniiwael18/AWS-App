# 🚀 SkillSwap - AWS-Powered Skill Exchange Platform

A modern, full-stack skill-sharing platform built with React, Node.js, and AWS services. Connect with others to exchange knowledge, learn new skills, and build meaningful connections.

## 🏗️ **Architecture Overview**

### **Frontend**
- **React 19** with Vite for fast development
- **Tailwind CSS** with modern green-purple gradient design
- **React Router** for navigation
- **AWS Amplify** for authentication (production ready)
- **Axios** for API communication
- **Socket.IO Client** for real-time chat

### **Backend**
- **Node.js & Express** REST API
- **Socket.IO** for real-time messaging
- **AWS SDK v2** for service integration
- **JWT** authentication with AWS Cognito
- **Express Validator** for input validation

### **AWS Services**
- **DynamoDB** - NoSQL database for all data storage
- **Cognito** - User authentication and management
- **S3** - File storage for profile pictures and documents
- **IAM** - Access control and permissions

### **Database Schema (DynamoDB)**
```
📋 Tables:
├── skillswap-users      # User profiles and skills
├── skillswap-matches    # Match requests and responses
├── skillswap-messages   # Chat messages
├── skillswap-ratings    # User ratings and reviews
└── skillswap-skills     # Skill catalog (optional)
```

## 🛠️ **Prerequisites**

- **Node.js** >= 18.0.0
- **npm** or **yarn**
- **AWS Account** with appropriate permissions
- **AWS CLI** configured (optional but recommended)

## 🚀 **Quick Start**

### 1. **Clone the Repository**
```bash
git clone <repository-url>
cd skillswap
```

### 2. **Backend Setup**
```bash
cd backend
npm install
npm run setup  # Creates .env file and sets up basic configuration
```

### 3. **Frontend Setup**
```bash
cd frontend
npm install
```

### 4. **AWS Configuration**
Create your AWS resources and update the `.env` file:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

# AWS Cognito
COGNITO_USER_POOL_ID=your_user_pool_id
COGNITO_CLIENT_ID=your_client_id

# Enable development mode (bypasses AWS auth)
BYPASS_AUTH=true
```

### 5. **Initialize Database**
```bash
cd backend
npm run setup-db  # Creates all DynamoDB tables
```

### 6. **Start Development Servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173` to see the application! 🎉

## 🔧 **AWS Setup Guide**

### **1. AWS Cognito Setup**
```bash
# Create User Pool
aws cognito-idp create-user-pool \
    --pool-name skillswap-users \
    --policies PasswordPolicy='{MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true}' \
    --auto-verified-attributes email

# Create User Pool Client
aws cognito-idp create-user-pool-client \
    --user-pool-id your-user-pool-id \
    --client-name skillswap-client
```

### **2. DynamoDB Tables**
The setup script automatically creates all required tables:
- Users table with email and location indexes
- Matches table with user and status indexes
- Messages table with conversation and sender indexes
- Ratings table with user indexes

### **3. IAM Permissions**
Create an IAM user with these permissions:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:*",
                "cognito-idp:*",
                "s3:*"
            ],
            "Resource": "*"
        }
    ]
}
```

## 📡 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout

### **Users**
- `GET /api/users/me` - Get current user profile
- `GET /api/users/:userId` - Get user by ID
- `PUT /api/users/:userId` - Update user profile
- `GET /api/users/:userId/stats` - Get user statistics
- `GET /api/users/search/skills` - Search users by skills
- `GET /api/users/search/location` - Search users by location

### **Skills**
- `POST /api/users/:userId/skills` - Add skill to user
- `DELETE /api/users/:userId/skills` - Remove skill from user

### **Matches**
- `GET /api/users/:userId/matches` - Get potential matches
- `POST /api/matches` - Create match request
- `GET /api/matches/user/:userId` - Get user's matches
- `PUT /api/matches/:matchId/respond` - Accept/decline match

### **Messages**
- `GET /api/messages/:conversationId` - Get conversation messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversations/:userId` - Get user conversations

## 🎨 **Design System**

### **Color Palette**
```css
/* Primary Colors - Green */
primary-50: #f0fdf4    primary-600: #16a34a
primary-100: #dcfce7   primary-700: #15803d
primary-200: #bbf7d0   primary-800: #166534
primary-300: #86efac   primary-900: #14532d
primary-400: #4ade80
primary-500: #22c55e

/* Secondary Colors - Purple */
secondary-50: #faf5ff   secondary-600: #9333ea
secondary-100: #f3e8ff  secondary-700: #7c3aed
secondary-200: #e9d5ff  secondary-800: #6b21a8
secondary-300: #d8b4fe  secondary-900: #581c87
secondary-400: #c084fc
secondary-500: #a855f7

/* Accent Colors - Orange */
accent-500: #f97316
accent-600: #ea580c
```

### **Components**
- **Glassmorphism** cards with backdrop blur
- **Gradient buttons** with hover animations
- **Smooth transitions** (300ms duration)
- **Modern animations** with staggered delays
- **Mobile-first** responsive design

## 🔄 **Real-Time Features**

### **Socket.IO Events**
```javascript
// Connection
socket.on('connect', () => {});

// Messages
socket.emit('join-room', { conversationId });
socket.emit('send-message', { messageData });
socket.on('new-message', (message) => {});

// Typing indicators
socket.emit('typing', { conversationId, userId });
socket.on('user-typing', ({ userId, conversationId }) => {});

// User presence
socket.on('user-online', ({ userId }) => {});
socket.on('user-offline', ({ userId }) => {});
```

## 🧪 **Development Features**

### **Mock Data Mode**
Set `BYPASS_AUTH=true` in `.env` to enable development mode:
- Bypasses AWS Cognito authentication
- Uses mock user data
- Enables rapid development without AWS setup

### **Hot Module Replacement**
Both frontend and backend support hot reloading:
- Frontend: Vite HMR
- Backend: Nodemon with file watching

### **Error Handling**
- Comprehensive error handling with proper HTTP status codes
- Client-side error boundaries
- API error interceptors with automatic token refresh

## 📊 **Performance Optimizations**

### **Frontend**
- **Code splitting** with React.lazy()
- **Image optimization** with lazy loading
- **Memoization** for expensive computations
- **Virtual scrolling** for large lists

### **Backend**
- **Connection pooling** for database connections
- **Compression** middleware for response size
- **Rate limiting** to prevent abuse
- **Caching** with Redis (optional)

### **Database**
- **Global Secondary Indexes** for efficient queries
- **Batch operations** for bulk updates
- **Pagination** for large result sets
- **Query optimization** with proper key design

## 🔐 **Security Features**

### **Authentication & Authorization**
- **JWT tokens** with AWS Cognito
- **Role-based access control** (RBAC)
- **API key authentication** for sensitive operations
- **CORS configuration** for cross-origin requests

### **Data Protection**
- **Input validation** with express-validator
- **SQL injection prevention** (N/A for NoSQL)
- **XSS protection** with helmet.js
- **Rate limiting** to prevent DoS attacks

### **Privacy**
- **Data encryption** at rest and in transit
- **PII anonymization** options
- **GDPR compliance** features
- **User data export/deletion**

## 🚀 **Production Deployment**

### **Backend (AWS Lambda + API Gateway)**
```bash
# Install Serverless Framework
npm install -g serverless

# Deploy to AWS
cd backend
serverless deploy
```

### **Frontend (AWS S3 + CloudFront)**
```bash
# Build for production
cd frontend
npm run build

# Deploy to S3
aws s3 sync dist/ s3://your-bucket-name --delete
```

### **Database (DynamoDB)**
- Use **On-Demand billing** for variable traffic
- Enable **Point-in-Time Recovery** for backups
- Set up **Auto Scaling** for provisioned capacity
- Configure **Global Tables** for multi-region support

## 📈 **Monitoring & Analytics**

### **AWS CloudWatch**
- API Gateway metrics
- Lambda function metrics
- DynamoDB performance metrics
- Custom application metrics

### **Application Monitoring**
- Error tracking with Sentry
- Performance monitoring
- User analytics with Google Analytics
- A/B testing capabilities

## 🧪 **Testing**

### **Backend Tests**
```bash
cd backend
npm test                 # Run all tests
npm run test:unit       # Unit tests only
npm run test:integration # Integration tests
npm run test:coverage   # Coverage report
```

### **Frontend Tests**
```bash
cd frontend
npm test                # Run all tests
npm run test:e2e       # End-to-end tests
npm run test:component # Component tests
```

## 🤝 **Contributing**

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

### **Common Issues**
- **DynamoDB Access Denied**: Check IAM permissions
- **Cognito Setup**: Verify User Pool configuration
- **CORS Errors**: Update backend CORS settings
- **WebSocket Connection**: Check firewall settings

### **Getting Help**
- 📧 Email: support@skillswap.com
- 💬 Discord: [Join our community](https://discord.gg/skillswap)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 Docs: [Full Documentation](https://docs.skillswap.com)

## 🎯 **Roadmap**

- [ ] **Mobile App** (React Native)
- [ ] **Video Calling** (WebRTC integration)
- [ ] **AI-Powered Matching** (ML recommendations)
- [ ] **Skill Verification** (Badges & certificates)
- [ ] **Payment Integration** (Stripe/PayPal)
- [ ] **Advanced Analytics** (User behavior tracking)
- [ ] **Multi-language Support** (i18n)
- [ ] **Progressive Web App** (PWA features)

---

**Built with ❤️ using AWS, React, and Node.js**

*Ready to start sharing skills and building connections? Let's go!* 🚀 