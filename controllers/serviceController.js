const Service = require('../models/Service');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all services
// @route   GET /api/v1/services
// @access  Public
const getServices = asyncHandler(async (req, res) => {
  const { category, featured, active = 'true' } = req.query;

  // Build query
  const query = { active: active === 'true' };
  
  if (category) query.category = category;
  if (featured !== undefined) query.featured = featured === 'true';

  const services = await Service.find(query)
    .sort({ featured: -1, order: 1 })
    .select('-__v -metadata.views -metadata.inquiries');

  res.json({
    success: true,
    data: {
      services
    },
    message: 'Services retrieved successfully'
  });
});

// @desc    Get single service
// @route   GET /api/v1/services/:id
// @access  Public
const getService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id).select('-__v');

  if (!service || !service.active) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Service not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Increment views (don't await to avoid slowing response)
  service.incrementViews().catch(err => console.error('Error incrementing views:', err));

  res.json({
    success: true,
    data: service,
    message: 'Service retrieved successfully'
  });
});

// @desc    Create new service (Admin only)
// @route   POST /api/v1/services
// @access  Private (Admin)
const createService = asyncHandler(async (req, res) => {
  const service = await Service.create(req.body);

  res.status(201).json({
    success: true,
    data: service,
    message: 'Service created successfully'
  });
});

// @desc    Update service (Admin only)
// @route   PUT /api/v1/services/:id
// @access  Private (Admin)
const updateService = asyncHandler(async (req, res) => {
  let service = await Service.findById(req.params.id);

  if (!service) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Service not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  service = await Service.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).select('-__v');

  res.json({
    success: true,
    data: service,
    message: 'Service updated successfully'
  });
});

// @desc    Delete service (Admin only)
// @route   DELETE /api/v1/services/:id
// @access  Private (Admin)
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Service not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  await Service.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    data: null,
    message: 'Service deleted successfully'
  });
});

// @desc    Get services by category
// @route   GET /api/v1/services/category/:category
// @access  Public
const getServicesByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;

  const services = await Service.getByCategory(category);

  res.json({
    success: true,
    data: {
      services,
      category
    },
    message: `Services in ${category} category retrieved successfully`
  });
});

// @desc    Get featured services
// @route   GET /api/v1/services/featured
// @access  Public
const getFeaturedServices = asyncHandler(async (req, res) => {
  const { limit = 4 } = req.query;

  const services = await Service.find({
    featured: true,
    active: true
  })
    .sort({ order: 1 })
    .limit(parseInt(limit))
    .select('-__v -metadata.views -metadata.inquiries');

  res.json({
    success: true,
    data: {
      services
    },
    message: 'Featured services retrieved successfully'
  });
});

// @desc    Record service inquiry (Admin only)
// @route   POST /api/v1/services/:id/inquiry
// @access  Private (Admin)
const recordInquiry = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Service not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  await service.incrementInquiries();

  res.json({
    success: true,
    data: {
      id: service._id,
      inquiries: service.metadata.inquiries + 1
    },
    message: 'Service inquiry recorded successfully'
  });
});

// @desc    Get service statistics (Admin only)
// @route   GET /api/v1/services/stats
// @access  Private (Admin)
const getServiceStats = asyncHandler(async (req, res) => {
  const totalServices = await Service.countDocuments();
  const activeServices = await Service.countDocuments({ active: true });
  const featuredServices = await Service.countDocuments({ featured: true, active: true });

  // Services by category
  const categoryStats = await Service.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        active: {
          $sum: {
            $cond: ['$active', 1, 0]
          }
        }
      }
    }
  ]);

  // Most viewed services
  const mostViewed = await Service.find({ active: true })
    .sort({ 'metadata.views': -1 })
    .limit(5)
    .select('title metadata.views');

  // Most inquired services
  const mostInquired = await Service.find({ active: true })
    .sort({ 'metadata.inquiries': -1 })
    .limit(5)
    .select('title metadata.inquiries');

  res.json({
    success: true,
    data: {
      overview: {
        total: totalServices,
        active: activeServices,
        featured: featuredServices
      },
      byCategory: categoryStats.reduce((acc, stat) => {
        acc[stat._id] = {
          total: stat.count,
          active: stat.active
        };
        return acc;
      }, {}),
      mostViewed,
      mostInquired
    },
    message: 'Service statistics retrieved successfully'
  });
});

module.exports = {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getServicesByCategory,
  getFeaturedServices,
  recordInquiry,
  getServiceStats
};