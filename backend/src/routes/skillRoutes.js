const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const SkillController = require('../controllers/skillController');

// Public routes
router.get('/popular', SkillController.getPopularSkills);
router.get('/categories', SkillController.getSkillCategories);
router.get('/search', optionalAuth, SkillController.searchSkills);

// Protected routes
router.use(authenticate); // All routes below require authentication

// Skill management routes
router.get('/', SkillController.getUserSkills);
router.post('/', SkillController.addUserSkill);
router.put('/:skillId', SkillController.updateUserSkill);
router.delete('/:skillId', SkillController.removeUserSkill);

// Skill validation routes
router.post('/validate', SkillController.validateSkill);
router.post('/:skillId/endorse', SkillController.endorseSkill);

// Skill statistics routes
router.get('/stats', SkillController.getSkillStats);

// Skill recommendations routes
router.get('/recommendations', SkillController.getSkillRecommendations);

module.exports = router; 