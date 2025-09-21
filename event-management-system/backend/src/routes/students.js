const express = require('express');
const { authenticateToken, requireStudent } = require('../middleware/auth');

const router = express.Router();

// All routes require student authentication
router.use(authenticateToken);
router.use(requireStudent);

// Student-specific routes can be added here
// For now, most student functionality is handled through other route files

// Get student dashboard data (could include personalized event recommendations, etc.)
router.get('/dashboard', async (req, res) => {
  try {
    // This could include personalized recommendations, nearby events, etc.
    res.status(200).json({
      success: true,
      message: 'Student dashboard data',
      data: {
        userId: req.user._id,
        welcomeMessage: `Welcome back, ${req.user.name}!`,
        // Add more personalized data as needed
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

module.exports = router;
