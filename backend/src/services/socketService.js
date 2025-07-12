const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.socketUsers = new Map(); // socketId -> userData
  }

  initialize(io) {
    this.io = io;
    console.log('Socket.IO service initialized');
  }

  // Authenticate socket connection
  authenticateSocket(socket, token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.id;
      socket.userEmail = decoded.email;
      socket.userName = decoded.name;
      socket.authenticated = true;
      
      // Store user-socket mapping
      this.connectedUsers.set(decoded.id, socket.id);
      this.socketUsers.set(socket.id, {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        connectedAt: new Date().toISOString()
      });
      
      console.log(`User authenticated: ${decoded.name} (${decoded.email})`);
      return true;
    } catch (error) {
      console.error('Socket authentication error:', error);
      socket.authenticated = false;
      return false;
    }
  }

  // Handle user disconnection
  handleDisconnect(socket) {
    if (socket.userId) {
      this.connectedUsers.delete(socket.userId);
      this.socketUsers.delete(socket.id);
      console.log(`User disconnected: ${socket.userName}`);
      
      // Notify other users about offline status
      this.broadcastUserStatus(socket.userId, 'offline');
    }
  }

  // Broadcast user online/offline status
  broadcastUserStatus(userId, status) {
    if (this.io) {
      this.io.emit('user-status-change', {
        userId,
        status,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Send message to specific user
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId && this.io) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  // Send message to all users in a chat room
  sendToRoom(roomId, event, data) {
    if (this.io) {
      this.io.to(roomId).emit(event, data);
      return true;
    }
    return false;
  }

  // Get online users
  getOnlineUsers() {
    return Array.from(this.socketUsers.values());
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  // Handle typing indicators
  handleTyping(socket, { matchId, isTyping }) {
    if (!socket.authenticated) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    const roomId = `chat-${matchId}`;
    socket.to(roomId).emit('user-typing', {
      userId: socket.userId,
      userName: socket.userName,
      isTyping,
      timestamp: new Date().toISOString()
    });
  }

  // Handle joining chat rooms
  handleJoinChat(socket, matchId) {
    if (!socket.authenticated) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    const roomId = `chat-${matchId}`;
    socket.join(roomId);
    
    console.log(`User ${socket.userName} joined chat room: ${roomId}`);
    
    // Notify user they joined successfully
    socket.emit('chat-joined', { 
      matchId, 
      roomId,
      timestamp: new Date().toISOString()
    });

    // Notify other users in the room
    socket.to(roomId).emit('user-joined-chat', {
      userId: socket.userId,
      userName: socket.userName,
      matchId,
      timestamp: new Date().toISOString()
    });
  }

  // Handle leaving chat rooms
  handleLeaveChat(socket, matchId) {
    if (!socket.authenticated) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    const roomId = `chat-${matchId}`;
    socket.leave(roomId);
    
    console.log(`User ${socket.userName} left chat room: ${roomId}`);
    
    // Notify other users in the room
    socket.to(roomId).emit('user-left-chat', {
      userId: socket.userId,
      userName: socket.userName,
      matchId,
      timestamp: new Date().toISOString()
    });
  }

  // Handle sending messages
  handleSendMessage(socket, { matchId, message, messageType = 'text' }) {
    if (!socket.authenticated) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    const roomId = `chat-${matchId}`;
    const messageData = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: socket.userId,
      senderName: socket.userName,
      senderEmail: socket.userEmail,
      content: message,
      messageType,
      matchId,
      timestamp: new Date().toISOString(),
      delivered: false,
      read: false
    };

    // Broadcast message to all users in the chat room
    this.io.to(roomId).emit('new-message', messageData);
    
    // Store message in database (in a real app)
    // await MessageService.createMessage(messageData);
    
    console.log(`Message sent to chat ${matchId}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);

    // Send delivery confirmation to sender
    socket.emit('message-sent', {
      messageId: messageData.id,
      timestamp: messageData.timestamp
    });
  }

  // Handle message read receipts
  handleMessageRead(socket, { messageId, matchId }) {
    if (!socket.authenticated) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    const roomId = `chat-${matchId}`;
    
    // Notify other users that message was read
    socket.to(roomId).emit('message-read', {
      messageId,
      readBy: socket.userId,
      readByName: socket.userName,
      timestamp: new Date().toISOString()
    });
  }

  // Handle match notifications
  sendMatchNotification(userId, matchData) {
    this.sendToUser(userId, 'new-match', {
      match: matchData,
      timestamp: new Date().toISOString()
    });
  }

  // Handle skill request notifications
  sendSkillRequestNotification(userId, requestData) {
    this.sendToUser(userId, 'skill-request', {
      request: requestData,
      timestamp: new Date().toISOString()
    });
  }

  // Get socket statistics
  getStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      totalSockets: this.socketUsers.size,
      onlineUsers: this.getOnlineUsers().length,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
module.exports = new SocketService(); 