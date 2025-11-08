const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  createAdmin,
  getUsers,
  updateUserRole
} = require('../controllers/authController');
const { authenticate, adminOnly } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validateObjectId
} = require('../middleware/validation');
const { body } = require('express-validator');

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);

// Development only route
router.post('/create-admin', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], createAdmin);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('phone').optional().trim().isMobilePhone('any', { strictMode: false }).withMessage('Please provide a valid phone number')
], updateProfile);

router.put('/password', authenticate, [
  body('currentPassword').isLength({ min: 1 }).withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
], changePassword);

// Admin only routes
router.get('/users', adminOnly, getUsers);
router.put('/users/:id/role', adminOnly, validateObjectId(), [
  body('role').isIn(['user', 'agent', 'admin']).withMessage('Role must be user, agent, or admin')
], updateUserRole);

module.exports = router;