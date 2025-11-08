const Property = require('../models/Property');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all properties with filtering and pagination
// @route   GET /api/v1/properties
// @access  Public
const getProperties = asyncHandler(async (req, res) => {
  const {
    type,
    category,
    location,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
    sort = '-createdAt',
    featured,
    status = 'Available'
  } = req.query;

  // Build query object
  const query = { status };

  // Add filters
  if (type) query.type = type;
  if (category) query.category = category;
  if (featured !== undefined) query.featured = featured === 'true';

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  // Location search (text search)
  if (location) {
    query.$or = [
      { location: { $regex: location, $options: 'i' } },
      { name: { $regex: location, $options: 'i' } },
      { description: { $regex: location, $options: 'i' } }
    ];
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Execute query
  const properties = await Property.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limitNum)
    .select('-__v');

  // Get total count for pagination
  const totalItems = await Property.countDocuments(query);
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
      properties,
      pagination
    },
    message: 'Properties retrieved successfully'
  });
});

// @desc    Get single property by ID
// @route   GET /api/v1/properties/:id
// @access  Public
const getProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).select('-__v');

  if (!property) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Property not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Increment views (optional - don't await to avoid slowing response)
  property.incrementViews().catch(err => console.error('Error incrementing views:', err));

  res.json({
    success: true,
    data: property,
    message: 'Property retrieved successfully'
  });
});

// @desc    Create new property
// @route   POST /api/v1/properties
// @access  Private (Admin only)
const createProperty = asyncHandler(async (req, res) => {
  // Add created by user info if needed
  const propertyData = {
    ...req.body,
    createdBy: req.user._id
  };

  const property = await Property.create(propertyData);

  res.status(201).json({
    success: true,
    data: {
      id: property._id,
      name: property.name,
      description: property.description,
      category: property.category,
      subcategory: property.subcategory,
      location: property.location,
      price: property.price,
      priceFormatted: property.priceFormatted,
      type: property.type,
      status: property.status,
      featured: property.featured,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt
    },
    message: 'Property created successfully'
  });
});

// @desc    Update property
// @route   PUT /api/v1/properties/:id
// @access  Private (Admin only)
const updateProperty = asyncHandler(async (req, res) => {
  let property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Property not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Update property
  property = await Property.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).select('-__v');

  res.json({
    success: true,
    data: {
      id: property._id,
      name: property.name,
      price: property.price,
      priceFormatted: property.priceFormatted,
      status: property.status,
      featured: property.featured,
      updatedAt: property.updatedAt
    },
    message: 'Property updated successfully'
  });
});

// @desc    Delete property
// @route   DELETE /api/v1/properties/:id
// @access  Private (Admin only)
const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Property not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  await Property.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    data: null,
    message: 'Property deleted successfully'
  });
});

// @desc    Get property statistics
// @route   GET /api/v1/properties/stats
// @access  Private (Admin only)
const getPropertyStats = asyncHandler(async (req, res) => {
  const stats = await Property.aggregate([
    {
      $group: {
        _id: null,
        totalProperties: { $sum: 1 },
        averagePrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    }
  ]);

  const statusStats = await Property.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const categoryStats = await Property.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        averagePrice: { $avg: '$price' }
      }
    }
  ]);

  const typeStats = await Property.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      overview: stats[0] || {
        totalProperties: 0,
        averagePrice: 0,
        minPrice: 0,
        maxPrice: 0
      },
      byStatus: statusStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      byCategory: categoryStats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          averagePrice: stat.averagePrice
        };
        return acc;
      }, {}),
      byType: typeStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    },
    message: 'Property statistics retrieved successfully'
  });
});

// @desc    Search properties
// @route   GET /api/v1/properties/search
// @access  Public
const searchProperties = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Search query is required'
      },
      timestamp: new Date().toISOString()
    });
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Text search
  const properties = await Property.find(
    {
      $text: { $search: q },
      status: 'Available'
    },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limitNum)
    .select('-__v');

  const totalItems = await Property.countDocuments({
    $text: { $search: q },
    status: 'Available'
  });

  const totalPages = Math.ceil(totalItems / limitNum);

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
      properties,
      pagination,
      searchQuery: q
    },
    message: `Found ${totalItems} properties matching "${q}"`
  });
});

// @desc    Get featured properties
// @route   GET /api/v1/properties/featured
// @access  Public
const getFeaturedProperties = asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;

  const properties = await Property.find({
    featured: true,
    status: 'Available'
  })
    .sort('-createdAt')
    .limit(parseInt(limit))
    .select('-__v');

  res.json({
    success: true,
    data: {
      properties
    },
    message: 'Featured properties retrieved successfully'
  });
});

module.exports = {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyStats,
  searchProperties,
  getFeaturedProperties
};