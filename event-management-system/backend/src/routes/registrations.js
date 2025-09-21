const express = require('express');
const { body } = require('express-validator');
const {
  createRegistration,
  getUserRegistrations,
  getRegistrationById,
  updateRegistration,
  cancelRegistration,
  getUserRegistrationStats
} = require('../controllers/registrationController');
const { authenticateToken, requireStudent } = require('../middleware/auth');
const { uploadPaymentScreenshot, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Validation rules for registration
const createRegistrationValidation = [
  body('registrationType')
    .isIn(['individual', 'team'])
    .withMessage('Registration type must be individual or team'),
  body('teamName')
    .if(body('registrationType').equals('team'))
    .notEmpty()
    .withMessage('Team name is required for team registration')
    .isLength({ max: 100 })
    .withMessage('Team name cannot exceed 100 characters')
    .trim(),
  body('teamMembers')
    .if(body('registrationType').equals('team'))
    .isArray({ min: 1 })
    .withMessage('Team members are required for team registration'),
  body('teamMembers.*.name')
    .if(body('registrationType').equals('team'))
    .notEmpty()
    .withMessage('Team member name is required')
    .isLength({ max: 50 })
    .withMessage('Team member name cannot exceed 50 characters')
    .trim(),
  body('contactDetails.email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('contactDetails.primaryPhone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid Indian phone number'),
  body('contactDetails.alternatePhone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid alternate phone number'),
  body('academicDetails.college')
    .notEmpty()
    .withMessage('College is required')
    .isLength({ max: 100 })
    .withMessage('College name cannot exceed 100 characters')
    .trim(),
  body('academicDetails.department')
    .notEmpty()
    .withMessage('Department is required')
    .isLength({ max: 50 })
    .withMessage('Department name cannot exceed 50 characters')
    .trim(),
  body('academicDetails.year')
    .notEmpty()
    .withMessage('Year is required'),
  body('academicDetails.rollNumber')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Roll number cannot exceed 20 characters')
    .trim(),
  body('location.city')
    .notEmpty()
    .withMessage('City is required')
    .isLength({ max: 50 })
    .withMessage('City name cannot exceed 50 characters')
    .trim(),
  body('location.state')
    .optional()
    .isLength({ max: 50 })
    .withMessage('State name cannot exceed 50 characters')
    .trim(),
  body('location.pincode')
    .optional()
    .matches(/^\d{6}$/)
    .withMessage('Please provide a valid 6-digit pincode'),
  body('paymentDetails.amount')
    .isNumeric()
    .withMessage('Payment amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Payment amount cannot be negative'),
  body('paymentDetails.transactionId')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Transaction ID cannot exceed 100 characters')
    .trim(),
  body('specialRequirements')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special requirements cannot exceed 500 characters')
    .trim(),
  body('emergencyContact.name')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Emergency contact name cannot exceed 50 characters')
    .trim(),
  body('emergencyContact.phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid emergency contact phone number'),
  body('emergencyContact.relation')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Relation cannot exceed 20 characters')
    .trim()
];

// Protected routes (require authentication)
router.use(authenticateToken);

// Registration routes
router.post('/event/:eventId', 
  requireStudent,
  uploadPaymentScreenshot.single('paymentScreenshot'),
  handleUploadError,
  createRegistrationValidation,
  createRegistration
);

router.get('/', requireStudent, getUserRegistrations);
router.get('/stats', requireStudent, getUserRegistrationStats);
router.get('/:id', requireStudent, getRegistrationById);

router.put('/:id', 
  requireStudent,
  uploadPaymentScreenshot.single('paymentScreenshot'),
  handleUploadError,
  updateRegistration
);

router.delete('/:id', requireStudent, cancelRegistration);

module.exports = router;
