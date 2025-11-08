const { body, query, param, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const details = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details
      },
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

// Property validation rules
const validateProperty = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Property name must be between 1 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('category')
    .isIn(['Residential', 'Commercial'])
    .withMessage('Category must be either Residential or Commercial'),
  
  body('subcategory')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Subcategory is required'),
  
  body('location')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Location must be between 1 and 200 characters'),
  
  body('price')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('type')
    .isIn(['Buy', 'Sell', 'Lease Out'])
    .withMessage('Type must be Buy, Sell, or Lease Out'),
  
  body('image')
    .trim()
    .isURL()
    .withMessage('Main image must be a valid URL'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
  
  body('features.area')
    .isNumeric()
    .isFloat({ min: 1 })
    .withMessage('Area must be a positive number'),
  
  body('features.bedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bedrooms must be a non-negative integer'),
  
  body('features.bathrooms')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Bathrooms must be a non-negative number'),
  
  body('status')
    .optional()
    .isIn(['Available', 'Pending', 'Sold', 'Rented', 'Off Market'])
    .withMessage('Invalid status'),
  
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  
  handleValidationErrors
];

// Property update validation (partial)
const validatePropertyUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Property name must be between 1 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('category')
    .optional()
    .isIn(['Residential', 'Commercial'])
    .withMessage('Category must be either Residential or Commercial'),
  
  body('price')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('type')
    .optional()
    .isIn(['Buy', 'Sell', 'Lease Out'])
    .withMessage('Type must be Buy, Sell, or Lease Out'),
  
  body('status')
    .optional()
    .isIn(['Available', 'Pending', 'Sold', 'Rented', 'Off Market'])
    .withMessage('Invalid status'),
  
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  
  handleValidationErrors
];

// Contact form validation
const validateContact = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number'),
  
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Subject cannot exceed 200 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  
  body('propertyId')
    .optional()
    .isMongoId()
    .withMessage('Invalid property ID'),
  
  body('preferredContactMethod')
    .optional()
    .isIn(['email', 'phone', 'both'])
    .withMessage('Preferred contact method must be email, phone, or both'),
  
  handleValidationErrors
];

// Query parameter validation for properties
const validatePropertyQuery = [
  query('type')
    .optional()
    .isIn(['Buy', 'Sell', 'Lease Out'])
    .withMessage('Type must be Buy, Sell, or Lease Out'),
  
  query('category')
    .optional()
    .isIn(['Residential', 'Commercial'])
    .withMessage('Category must be either Residential or Commercial'),
  
  query('minPrice')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('location')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Location search term must be between 1 and 200 characters'),
  
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
  
  handleValidationErrors
];

// User registration validation
const validateUserRegistration = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number'),
  
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Service validation
const validateService = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Service title must be between 1 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  
  body('icon')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Icon is required'),
  
  body('features')
    .isArray({ min: 1 })
    .withMessage('At least one feature is required'),
  
  body('features.*')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Each feature must be between 1 and 200 characters'),
  
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateProperty,
  validatePropertyUpdate,
  validateContact,
  validatePropertyQuery,
  validateObjectId,
  validateUserRegistration,
  validateUserLogin,
  validateService
};