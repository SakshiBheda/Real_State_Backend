const Contact = require('../models/Contact');
const Property = require('../models/Property');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Submit contact form
// @route   POST /api/v1/contact
// @access  Public
const submitContact = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    subject,
    message,
    propertyId,
    preferredContactMethod
  } = req.body;

  // Get client IP and user agent
  const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const userAgent = req.get('User-Agent');

  // Prepare contact data
  const contactData = {
    name,
    email,
    phone,
    subject,
    message,
    preferredContactMethod,
    ipAddress,
    userAgent,
    source: 'api'
  };

  // If propertyId is provided, validate it and get property name
  if (propertyId) {
    const property = await Property.findById(propertyId);
    if (property) {
      contactData.propertyId = propertyId;
      contactData.propertyName = property.name;
      
      // Set subject if not provided
      if (!subject) {
        contactData.subject = `Inquiry about ${property.name}`;
      }
    }
  }

  // Create contact record
  const contact = await Contact.create(contactData);

  // Return response (excluding sensitive data)
  res.status(201).json({
    success: true,
    data: {
      id: contact._id,
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
      status: contact.status,
      submittedAt: contact.createdAt
    },
    message: 'Thank you for your inquiry. We will get back to you within 24 hours.'
  });
});

// @desc    Get all contacts (Admin only)
// @route   GET /api/v1/contact
// @access  Private (Admin)
const getContacts = asyncHandler(async (req, res) => {
  const {
    status,
    priority,
    page = 1,
    limit = 20,
    sort = '-createdAt',
    search
  } = req.query;

  // Build query
  const query = {};
  
  if (status) query.status = status;
  if (priority) query.priority = priority;
  
  // Search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Execute query
  const contacts = await Contact.find(query)
    .populate('propertyId', 'name location price')
    .sort(sort)
    .skip(skip)
    .limit(limitNum)
    .select('-__v -ipAddress -userAgent');

  // Get total count
  const totalItems = await Contact.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limitNum);

  // Pagination info
  const pagination = {
    currentPage: pageNum,
    totalPages,
    totalItems,
    itemsPerPage: limitNum,
    hasNextPage: pageNum < totalPages,
    hasPreviousPage: pageNum > 1
  };

  res.json({
    success: true,
    data: {
      contacts,
      pagination
    },
    message: 'Contacts retrieved successfully'
  });
});

// @desc    Get single contact (Admin only)
// @route   GET /api/v1/contact/:id
// @access  Private (Admin)
const getContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id)
    .populate('propertyId', 'name location price image')
    .select('-__v');

  if (!contact) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Contact not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    data: contact,
    message: 'Contact retrieved successfully'
  });
});

// @desc    Update contact status (Admin only)
// @route   PUT /api/v1/contact/:id
// @access  Private (Admin)
const updateContact = asyncHandler(async (req, res) => {
  const { status, notes, assignedTo, priority } = req.body;

  let contact = await Contact.findById(req.params.id);

  if (!contact) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Contact not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Update fields
  const updateData = {};
  if (status) updateData.status = status;
  if (notes) updateData.notes = notes;
  if (assignedTo) updateData.assignedTo = assignedTo;
  if (priority) updateData.priority = priority;

  // Set response date if status is being changed to 'contacted'
  if (status === 'contacted' && contact.status !== 'contacted') {
    updateData.responseDate = new Date();
  }

  contact = await Contact.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).select('-__v -ipAddress -userAgent');

  res.json({
    success: true,
    data: contact,
    message: 'Contact updated successfully'
  });
});

// @desc    Delete contact (Admin only)
// @route   DELETE /api/v1/contact/:id
// @access  Private (Admin)
const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Contact not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  await Contact.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    data: null,
    message: 'Contact deleted successfully'
  });
});

// @desc    Get contact statistics (Admin only)
// @route   GET /api/v1/contact/stats
// @access  Private (Admin)
const getContactStats = asyncHandler(async (req, res) => {
  const stats = await Contact.getStats();

  // Get recent contacts (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentContacts = await Contact.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });

  // Get contacts by priority
  const priorityStats = await Contact.aggregate([
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get top properties by inquiries
  const topProperties = await Contact.aggregate([
    {
      $match: { propertyId: { $exists: true } }
    },
    {
      $group: {
        _id: '$propertyId',
        count: { $sum: 1 },
        propertyName: { $first: '$propertyName' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 5
    }
  ]);

  res.json({
    success: true,
    data: {
      ...stats,
      recentContacts,
      byPriority: priorityStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      topProperties
    },
    message: 'Contact statistics retrieved successfully'
  });
});

// @desc    Mark contact as contacted (Admin only)
// @route   POST /api/v1/contact/:id/contacted
// @access  Private (Admin)
const markAsContacted = asyncHandler(async (req, res) => {
  const { notes } = req.body;

  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Contact not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  await contact.markAsContacted(notes);

  res.json({
    success: true,
    data: {
      id: contact._id,
      status: contact.status,
      responseDate: contact.responseDate,
      notes: contact.notes
    },
    message: 'Contact marked as contacted successfully'
  });
});

module.exports = {
  submitContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
  getContactStats,
  markAsContacted
};