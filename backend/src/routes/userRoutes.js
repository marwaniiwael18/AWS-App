const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const UserController = require('../controllers/userController');

// Public routes
router.get('/search', optionalAuth, UserController.searchUsers);
router.get('/skills/popular', UserController.getPopularSkills);

// Protected routes
router.use(authenticate); // All routes below require authentication

// User profile routes
router.get('/profile', UserController.getUserProfile);
router.put('/profile', UserController.updateUserProfile);
router.delete('/profile', UserController.deleteUserProfile);

// User skills routes
router.get('/skills', UserController.getUserSkills);
router.post('/skills', UserController.addSkill);
router.delete('/skills/:skillId', UserController.removeSkill);

// User preferences routes
router.get('/preferences', UserController.getUserPreferences);
router.put('/preferences', UserController.updateUserPreferences);

// User statistics routes
router.get('/stats', UserController.getUserStats);

// User rating routes
router.get('/ratings', UserController.getUserRatings);
router.post('/ratings/:userId', UserController.rateUser);

// User blocking/reporting routes
router.post('/block/:userId', UserController.blockUser);
router.post('/report/:userId', UserController.reportUser);

// User activity routes
router.get('/activity', UserController.getUserActivity);

module.exports = router; 