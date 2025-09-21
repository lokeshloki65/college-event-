const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  verifyToken,
  logout
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid Indian phone number'),
  body('college')
    .optional()
    .isLength({ max: 100 })
    .withMessage('College name cannot exceed 100 characters')
    .trim(),
  body('department')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Department name cannot exceed 50 characters')
    .trim(),
  body('year')
    .optional()
    .isIn(['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Post Graduate'])
    .withMessage('Invalid year selection'),
  body('city')
    .optional()
    .isLength({ max: 50 })
    .withMessage('City name cannot exceed 50 characters')
    .trim(),
  body('role')
    .optional()
    .isIn(['student', 'admin'])
    .withMessage('Invalid role')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim(),
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid Indian phone number'),
  body('college')
    .optional()
    .isLength({ max: 100 })
    .withMessage('College name cannot exceed 100 characters')
    .trim(),
  body('department')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Department name cannot exceed 50 characters')
    .trim(),
  body('year')
    .optional()
    .isIn(['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Post Graduate'])
    .withMessage('Invalid year selection'),
  body('city')
    .optional()
    .isLength({ max: 50 })
    .withMessage('City name cannot exceed 50 characters')
    .trim()
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfileValidation, updateProfile);
router.put('/change-password', authenticateToken, changePasswordValidation, changePassword);
router.get('/verify-token', authenticateToken, verifyToken);
router.post('/logout', authenticateToken, logout);

module.exports = router;
