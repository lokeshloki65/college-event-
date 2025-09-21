const express = require('express');
const {
  getEvents,
  getEventById,
  getEventsByStatus,
  getEventsByDepartment,
  getUserRegisteredEvents,
  searchEvents,
  getEventStats
} = require('../controllers/eventController');
const { optionalAuth, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes (with optional authentication)
router.get('/', optionalAuth, getEvents);
router.get('/search', optionalAuth, searchEvents);
router.get('/status/:status', optionalAuth, getEventsByStatus);
router.get('/department/:department', optionalAuth, getEventsByDepartment);
router.get('/:id', optionalAuth, getEventById);

// Protected routes (require authentication)
router.get('/user/registered', authenticateToken, getUserRegisteredEvents);
router.get('/:id/stats', authenticateToken, getEventStats);

module.exports = router;
