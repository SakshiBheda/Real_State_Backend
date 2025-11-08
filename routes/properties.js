const express = require('express');
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyStats,
  searchProperties,
  getFeaturedProperties
} = require('../controllers/propertyController');
const { adminOnly } = require('../middleware/auth');
const {
  validateProperty,
  validatePropertyUpdate,
  validatePropertyQuery,
  validateObjectId
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/search', searchProperties);
router.get('/featured', getFeaturedProperties);
router.get('/', validatePropertyQuery, getProperties);
router.get('/:id', validateObjectId(), getProperty);

// Admin only routes
router.get('/admin/stats', adminOnly, getPropertyStats);
router.post('/', adminOnly, validateProperty, createProperty);
router.put('/:id', adminOnly, validateObjectId(), validatePropertyUpdate, updateProperty);
router.delete('/:id', adminOnly, validateObjectId(), deleteProperty);

module.exports = router;