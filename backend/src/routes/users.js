const express = require('express');
const { body, param, query } = require('express-validator');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateCreateUser = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('name')
    .isLength({ min: 2, max: 50 })
    .trim()
    .withMessage('Name must be between 2 and 50 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .trim()
    .withMessage('Bio must be less than 500 characters'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .trim()
    .withMessage('Location must be less than 100 characters'),
  body('skillsOffered')
    .optional()
    .isArray()
    .withMessage('Skills offered must be an array'),
  body('skillsWanted')
    .optional()
    .isArray()
    .withMessage('Skills wanted must be an array'),
];

const validateUpdateUser = [
  param('userId').isUUID().withMessage('Invalid user ID'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .trim()
    .withMessage('Name must be between 2 and 50 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .trim()
    .withMessage('Bio must be less than 500 characters'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .trim()
    .withMessage('Location must be less than 100 characters'),
  body('skillsOffered')
    .optional()
    .isArray()
    .withMessage('Skills offered must be an array'),
  body('skillsWanted')
    .optional()
    .isArray()
    .withMessage('Skills wanted must be an array'),
];

const validateUserId = [
  param('userId').isUUID().withMessage('Invalid user ID')
];

const validateSkill = [
  param('userId').isUUID().withMessage('Invalid user ID'),
  body('skill')
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('Skill must be between 1 and 50 characters'),
  body('type')
    .optional()
    .isIn(['offered', 'wanted'])
    .withMessage('Type must be either "offered" or "wanted"'),
];

const validateRating = [
  param('userId').isUUID().withMessage('Invalid user ID'),
  body('rating')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
];

const validateSearchQuery = [
  query('skills')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') return true;
      if (Array.isArray(value)) return true;
      throw new Error('Skills must be a string or array');
    }),
  query('location')
    .optional()
    .isLength({ max: 100 })
    .trim()
    .withMessage('Location must be less than 100 characters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

// Public routes (no authentication required)
router.post('/register', validateCreateUser, userController.createUser);

// Routes requiring authentication
router.use(authMiddleware);

// User profile routes
router.get('/me', userController.getCurrentUser);
router.get('/:userId', validateUserId, userController.getUserProfile);
router.put('/:userId', validateUpdateUser, userController.updateUserProfile);
router.delete('/:userId', validateUserId, userController.deleteUser);

// User statistics
router.get('/:userId/stats', validateUserId, userController.getUserStats);

// Skill management
router.post('/:userId/skills', validateSkill, userController.addSkill);
router.delete('/:userId/skills', validateSkill, userController.removeSkill);

// User matching
router.get('/:userId/matches', validateUserId, userController.getPotentialMatches);

// User rating
router.put('/:userId/rating', validateRating, userController.updateUserRating);

// User search and discovery
router.get('/', validateSearchQuery, userController.getAllUsers);
router.get('/search/skills', validateSearchQuery, userController.searchUsersBySkills);
router.get('/search/location', validateSearchQuery, userController.getUsersByLocation);

module.exports = router; 