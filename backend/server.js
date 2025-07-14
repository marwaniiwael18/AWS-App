const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes
const userRoutes = require('./src/routes/userRoutes');
const matchRoutes = require('./src/routes/matchRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const skillRoutes = require('./src/routes/skillRoutes');

// Import middleware
const errorHandler = require('./src/middleware/errorHandler');
const authMiddleware = require('./src/middleware/authMiddleware');

// Import services
const socketService = require('./src/services/socketService');

// Create Express app
const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5174',  // Allow both ports
      'http://localhost:5173'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Environment variables
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

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
    'http://localhost:5174',  // Allow both ports
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'development' ? 1000 : 100, // Higher limit for development
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing & compression
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Static file serving for uploads with CORS headers
app.use('/uploads', (req, res, next) => {
  // Set CORS headers for static files
  res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Override Helmet's Cross-Origin-Resource-Policy for uploads
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/skills', skillRoutes);

// Socket.IO setup
socketService.initialize(io);

// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Handle user authentication
  socket.on('authenticate', (token) => {
    // In a real app, verify JWT token here
    console.log('User authenticated:', token);
    socket.authenticated = true;
    socket.emit('authenticated', { status: 'success' });
  });
  
  // Handle joining chat rooms
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });
  
  // Handle leaving chat rooms
  socket.on('leave-room', (room) => {
    socket.leave(room);
    console.log(`User ${socket.id} left room: ${room}`);
  });
  
  // Handle sending messages
  socket.on('send-message', (data) => {
    const { room, message, userId } = data;
    
    // Broadcast message to room
    socket.to(room).emit('receive-message', {
      message,
      userId,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle typing indicators
  socket.on('typing', (data) => {
    const { room, userId, isTyping } = data;
    socket.to(room).emit('user-typing', { userId, isTyping });
  });
  
  // Handle skill match notifications
  socket.on('skill-match', (data) => {
    const { targetUserId, matchData } = data;
    
    // Send notification to target user
    socket.to(targetUserId).emit('match-notification', matchData);
  });
  
  // Handle user presence
  socket.on('user-online', (userId) => {
    socket.userId = userId;
    socket.broadcast.emit('user-status-change', { userId, status: 'online' });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.userId) {
      socket.broadcast.emit('user-status-change', { 
        userId: socket.userId, 
        status: 'offline' 
      });
    }
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Handle 404 errors
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Initialize Socket.IO service
console.log('Socket.IO service initialized');

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`
🚀 SkillSwap Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Environment: ${NODE_ENV}
🌐 Port: ${PORT}
🔗 URL: http://localhost:${PORT}
🏥 Health: http://localhost:${PORT}/health
⚡ Socket.IO: Enabled
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Server is ready to accept connections! 🎉
  `);
});

module.exports = { app, server, io }; 