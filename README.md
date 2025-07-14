# 🚀 SkillSwap - Professional Skill Exchange Platform

A modern, full-stack web application that connects professionals to exchange skills and knowledge. Built with React, Node.js, and AWS services.
<img width="1440" height="900" alt="Screenshot 2025-07-14 at 12 52 09" src="https://github.com/user-attachments/assets/4f6448e9-b20c-4d68-b6a1-a80d48ad6950" />


## ✨ Features

- 🔐 **Secure Authentication** - AWS Cognito integration with email verification
- 👤 **Dynamic User Profiles** - Customizable profiles with skills and bio
- 🎯 **Smart Matching** - AI-powered skill matching algorithm
- 💬 **Real-time Chat** - WebSocket-based messaging system
- 📊 **Analytics Dashboard** - Track your skill exchanges and progress
- 🎨 **Modern UI/UX** - Beautiful gradient design with smooth animations
- 📱 **Responsive Design** - Works perfectly on all devices
- 🔒 **Privacy & Security** - Comprehensive privacy controls

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons
- **AWS Amplify** - AWS services integration
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Socket.IO** - Real-time bidirectional communication
- **AWS SDK** - AWS services integration
- **JWT** - JSON Web Tokens for authentication
- **Helmet** - Security middleware

### Database Options
- **DynamoDB** - AWS NoSQL database (recommended)
- **MongoDB** - Document database
- **PostgreSQL** - Relational database
- **In-memory** - For testing and development

### AWS Services
- **Cognito** - User authentication and management
- **DynamoDB** - NoSQL database
- **S3** - File storage
- **API Gateway** - API management (optional)
- **Lambda** - Serverless functions (optional)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- AWS Account (for production features)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/marwaniiwael18/AWS-App.git
cd AWS-App
```

### 2. Quick Setup (Recommended)
```bash
# Run the automated setup script
./quick-start.sh
```

This script will:
- ✅ Check prerequisites
- 📦 Install all dependencies
- 📝 Create environment files
- 🚀 Create start scripts

### 3. Manual Setup (Alternative)

#### Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

#### Environment Configuration
```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit with your actual credentials
```

### 4. Start the Application

#### Option A: Start Both Servers
```bash
./start-both.sh
```

#### Option B: Start Separately
```bash
# Terminal 1: Backend
./start-backend.sh

# Terminal 2: Frontend
./start-frontend.sh
```

### 5. Access Your Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 📋 Configuration Guide

### AWS Services Setup

For full functionality, you'll need to configure these AWS services:

#### 1. AWS Cognito (Authentication)
```bash
# Required environment variables
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
```

#### 2. Database Setup (Choose One)

**DynamoDB (Recommended)**
```bash
DB_TYPE=dynamodb
DYNAMODB_TABLE_USERS=skillswap-users
DYNAMODB_TABLE_MATCHES=skillswap-matches
DYNAMODB_TABLE_MESSAGES=skillswap-messages
```

**MongoDB**
```bash
DB_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/skillswap
```

**PostgreSQL**
```bash
DB_TYPE=postgresql
DATABASE_URL=postgresql://username:password@localhost:5432/skillswap
```

**In-Memory (Testing)**
```bash
DB_TYPE=memory
# No additional configuration needed
```

#### 3. File Storage (S3)
```bash
S3_BUCKET_NAME=skillswap-storage-bucket
AWS_REGION=us-east-1
```

For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).

## 🏗️ Project Structure

```
AWS-App/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts (Auth, Skills)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── aws-exports.js   # AWS configuration
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── config/          # Configuration files
│   ├── server.js            # Main server file
│   └── package.json
├── SETUP_GUIDE.md          # Detailed setup instructions
├── quick-start.sh          # Automated setup script
└── README.md               # This file
```

## 🔧 Development

### Available Scripts

#### Frontend
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

#### Backend
```bash
cd backend
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm test             # Run tests
```

### Environment Variables

#### Frontend (.env.local)
```env
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOLS_ID=us-east-1_XXXXXXXXX
VITE_AWS_USER_POOLS_WEB_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_API_BASE_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

#### Backend (.env)
```env
PORT=3000
NODE_ENV=development
DB_TYPE=memory
AWS_REGION=us-east-1
JWT_SECRET=your-super-secret-jwt-key
```

## 🚀 Deployment

### AWS Deployment (Recommended)
- **Frontend**: AWS Amplify or S3 + CloudFront
- **Backend**: AWS Lambda + API Gateway or EC2
- **Database**: DynamoDB or RDS

### Alternative Platforms
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Railway, Render, Heroku
- **Database**: MongoDB Atlas, PlanetScale, Supabase

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Test Coverage
```bash
# Backend coverage
cd backend
npm run test:coverage

# Frontend coverage
cd frontend
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📚 [Setup Guide](./SETUP_GUIDE.md) - Detailed configuration instructions
- 🐛 [Issues](https://github.com/marwaniiwael18/AWS-App/issues) - Report bugs or request features
- 📖 [AWS Documentation](https://docs.aws.amazon.com/) - AWS services documentation
- 💬 [Discussions](https://github.com/marwaniiwael18/AWS-App/discussions) - Community support

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - The web framework used
- [AWS](https://aws.amazon.com/) - Cloud services provider
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Heroicons](https://heroicons.com/) - Icon library
- [Socket.IO](https://socket.io/) - Real-time communication

---

**Made with ❤️ by [Marwan Iwael](https://github.com/marwaniiwael18)**

⭐ Star this repository if you find it helpful! 
