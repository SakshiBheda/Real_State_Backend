const express = require('express');
const {
  submitContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
  getContactStats,
  markAsContacted
} = require('../controllers/contactController');
const { adminOnly } = require('../middleware/auth');
const { validateContact, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/', validateContact, submitContact);

// Admin only routes
router.get('/stats', adminOnly, getContactStats);
router.get('/', adminOnly, getContacts);
router.get('/:id', adminOnly, validateObjectId(), getContact);
router.put('/:id', adminOnly, validateObjectId(), updateContact);
router.delete('/:id', adminOnly, validateObjectId(), deleteContact);
router.post('/:id/contacted', adminOnly, validateObjectId(), markAsContacted);

module.exports = router;