/**
 * 🚀 SkillSwap Express Application
 * Separated from server.js for serverless deployment compatibility
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const userRoutes = require('./src/routes/userRoutes');
const matchRoutes = require('./src/routes/matchRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const skillRoutes = require('./src/routes/skillRoutes');

// Import middleware
const errorHandler = require('./src/middleware/errorHandler');
const { authMiddleware, optionalAuthMiddleware } = require('./src/middleware/auth-v3');

// Create Express app
const app = express();

// =================================
// 🛡️ Security & Middleware Setup
// =================================

// Security middleware with custom configuration for uploads
app.use(helmet({
  crossOriginResourcePolicy: {
    policy: "cross-origin"
  }
}));

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5173',
    process.env.CORS_ORIGIN || '*'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving (for local development)
if (process.env.STORAGE_TYPE !== 's3') {
  app.use('/uploads', express.static('uploads'));
}

// =================================
// 🏥 Health Check Endpoint
// =================================

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SkillSwap API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: process.env.DB_TYPE || 'file',
      storage: process.env.STORAGE_TYPE || 'local',
      auth: process.env.BYPASS_AUTH === 'true' ? 'bypass' : 'cognito'
    }
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Welcome to SkillSwap API',
    documentation: '/api/docs',
    health: '/health',
    version: '1.0.0'
  });
});

// =================================
// 📡 API Routes
// =================================

// Mount API routes
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/skills', skillRoutes);

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    message: 'SkillSwap API Documentation',
    version: '1.0.0',
    endpoints: {
      users: {
        'GET /api/users': 'Get all users',
        'GET /api/users/current': 'Get current user profile',
        'POST /api/users': 'Create user profile',
        'PUT /api/users/current': 'Update current user',
        'POST /api/users/profile/photo': 'Upload profile photo',
        'DELETE /api/users/profile/photo': 'Delete profile photo'
      },
      matches: {
        'GET /api/matches': 'Get user matches',
        'POST /api/matches/request': 'Send match request',
        'PUT /api/matches/:id/respond': 'Respond to match request'
      },
      messages: {
        'GET /api/messages/:chatId': 'Get chat messages',
        'POST /api/messages': 'Send message'
      },
      skills: {
        'GET /api/skills/popular': 'Get popular skills',
        'POST /api/users/skills/add': 'Add skill to user',
        'DELETE /api/users/skills/remove': 'Remove skill from user'
      }
    },
    authentication: {
      type: process.env.BYPASS_AUTH === 'true' ? 'Development Bypass' : 'AWS Cognito',
      header: 'Authorization: Bearer <token>'
    }
  });
});

// =================================
// ❌ Error Handling
// =================================

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: {
      health: 'GET /health',
      api: 'GET /api/docs',
      users: 'GET /api/users',
      matches: 'GET /api/matches',
      messages: 'GET /api/messages',
      skills: 'GET /api/skills'
    },
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use(errorHandler);

// =================================
// 📤 Export App
// =================================

module.exports = app; 