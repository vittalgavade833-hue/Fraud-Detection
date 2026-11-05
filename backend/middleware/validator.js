const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Registration validation rules
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  validate,
];

/**
 * Login validation rules
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate,
];

/**
 * Transaction creation validation rules
 */
const transactionValidation = [
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('type')
    .notEmpty()
    .withMessage('Transaction type is required')
    .isIn(['purchase', 'transfer', 'withdrawal', 'deposit', 'payment', 'refund'])
    .withMessage('Invalid transaction type'),
  body('paymentMethod')
    .optional()
    .isIn(['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'crypto', 'other'])
    .withMessage('Invalid payment method'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  validate,
];

/**
 * Alert status update validation
 */
const alertStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['new', 'reviewed', 'confirmed_fraud', 'false_positive', 'investigating'])
    .withMessage('Invalid alert status'),
  validate,
];

/**
 * Investigation notes validation
 */
const investigationNotesValidation = [
  body('notes')
    .notEmpty()
    .withMessage('Investigation notes are required')
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters'),
  validate,
];

/**
 * Profile update validation
 */
const profileUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  validate,
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  transactionValidation,
  alertStatusValidation,
  investigationNotesValidation,
  profileUpdateValidation,
};
