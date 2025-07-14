const express = require('express');
const router = express.Router();
const { authMiddleware: authenticate } = require('../middleware/auth-v3');
const MatchController = require('../controllers/matchController');

// All routes require authentication
router.use(authenticate);

// Match discovery routes
router.get('/discover', MatchController.discoverMatches);
router.get('/potential', MatchController.getPotentialMatches);

// Match management routes
router.get('/', MatchController.getUserMatches);
router.get('/:matchId', MatchController.getMatchById);
router.post('/request', MatchController.sendMatchRequest);
router.put('/:matchId/respond', MatchController.respondToMatchRequest);
router.delete('/:matchId', MatchController.deleteMatch);

// Match preferences routes
router.get('/preferences', MatchController.getMatchPreferences);
router.put('/preferences', MatchController.updateMatchPreferences);

// Match statistics routes
router.get('/stats', MatchController.getMatchStats);

// Match recommendations routes
router.get('/recommendations', MatchController.getMatchRecommendations);

module.exports = router; 