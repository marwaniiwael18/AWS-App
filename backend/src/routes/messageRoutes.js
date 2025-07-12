const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const MessageController = require('../controllers/messageController');

// All routes require authentication
router.use(authenticate);

// Message management routes
router.get('/', MessageController.getUserMessages);
router.get('/:matchId', MessageController.getMatchMessages);
router.post('/', MessageController.sendMessage);
router.put('/:messageId/read', MessageController.markAsRead);
router.delete('/:messageId', MessageController.deleteMessage);

// Message search routes
router.get('/search', MessageController.searchMessages);

// Message statistics routes
router.get('/stats', MessageController.getMessageStats);

// Conversation routes
router.get('/conversations', MessageController.getConversations);
router.delete('/conversations/:matchId', MessageController.deleteConversation);

module.exports = router; 