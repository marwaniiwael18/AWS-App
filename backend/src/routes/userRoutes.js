const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const UserController = require('../controllers/userController');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Public routes
router.get('/search', optionalAuth, UserController.searchUsers);
router.get('/skills/popular', UserController.getPopularSkills);

// Protected routes
router.use(authenticate); // All routes below require authentication

// User profile routes
router.get('/profile', UserController.getUserProfile);
router.put('/profile', UserController.updateUserProfile);
router.delete('/profile', UserController.deleteUserProfile);

// Profile photo routes
router.post('/profile/photo', upload.single('profilePhoto'), UserController.uploadProfilePhoto);
router.delete('/profile/photo', UserController.deleteProfilePhoto);

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