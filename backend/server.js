const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
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
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Environment variables
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
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
  socket.on('join-chat', (matchId) => {
    if (!socket.authenticated) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }
    
    socket.join(`chat-${matchId}`);
    console.log(`User ${socket.id} joined chat ${matchId}`);
    socket.emit('chat-joined', { matchId });
  });
  
  // Handle sending messages
  socket.on('send-message', (data) => {
    if (!socket.authenticated) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }
    
    const { matchId, message, senderId, senderName } = data;
    
    // Broadcast message to all users in the chat room
    io.to(`chat-${matchId}`).emit('new-message', {
      id: Date.now(),
      senderId,
      senderName,
      content: message,
      timestamp: new Date().toISOString(),
      matchId
    });
    
    console.log(`Message sent to chat ${matchId}:`, message);
  });
  
  // Handle typing indicators
  socket.on('typing', (data) => {
    const { matchId, isTyping } = data;
    socket.to(`chat-${matchId}`).emit('user-typing', {
      userId: socket.id,
      isTyping
    });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
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

module.exports = app; 