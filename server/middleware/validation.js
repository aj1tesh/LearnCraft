const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    console.log('Request body:', req.body);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  body('role')
    .isIn(['instructor', 'student'])
    .withMessage('Role must be either instructor or student'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Course validation rules
const validateCourseCreation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Course title is required and must be less than 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Course description is required'),
  handleValidationErrors
];

// Lecture validation rules
const validateLectureCreation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Lecture title is required and must be less than 200 characters'),
  body('type')
    .isIn(['reading', 'quiz', 'text-document'])
    .withMessage('Lecture type must be either reading, quiz, or text-document'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Content cannot be empty if provided'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  handleValidationErrors
];

// Quiz question validation rules
const validateQuizQuestion = [
  body('questionText')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Question text is required'),
  body('options')
    .isArray({ min: 2 })
    .withMessage('At least 2 options are required'),
  body('options.*')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Each option must not be empty'),
  body('correctAnswer')
    .isInt({ min: 0 })
    .withMessage('Correct answer must be a valid option index'),
  handleValidationErrors
];

// Quiz submission validation
const validateQuizSubmission = [
  body('answers')
    .isArray()
    .withMessage('Answers must be an array'),
  body('answers.*')
    .isInt({ min: 0 })
    .withMessage('Each answer must be a valid option index'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateCourseCreation,
  validateLectureCreation,
  validateQuizQuestion,
  validateQuizSubmission
};
