const express = require('express');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getServicesByCategory,
  getFeaturedServices,
  recordInquiry,
  getServiceStats
} = require('../controllers/serviceController');
const { adminOnly } = require('../middleware/auth');
const { validateService, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/featured', getFeaturedServices);
router.get('/category/:category', getServicesByCategory);
router.get('/', getServices);
router.get('/:id', validateObjectId(), getService);

// Admin only routes
router.get('/admin/stats', adminOnly, getServiceStats);
router.post('/', adminOnly, validateService, createService);
router.put('/:id', adminOnly, validateObjectId(), updateService);
router.delete('/:id', adminOnly, validateObjectId(), deleteService);
router.post('/:id/inquiry', adminOnly, validateObjectId(), recordInquiry);

module.exports = router;