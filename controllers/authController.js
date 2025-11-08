const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'DUPLICATE_FIELD',
        message: 'User with this email already exists',
        details: [{
          field: 'email',
          message: 'Email already exists'
        }]
      },
      timestamp: new Date().toISOString()
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone
  });

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt
      },
      token
    },
    message: 'User registered successfully'
  });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by credentials
    const user = await User.findByCredentials(email, password);

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          lastLogin: user.lastLogin
        },
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    },
    message: 'User profile retrieved successfully'
  });
});

// @desc    Update user profile
// @route   PUT /api/v1/auth/me
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar, preferences } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (avatar) updateData.avatar = avatar;
  if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  );

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        preferences: user.preferences,
        updatedAt: user.updatedAt
      }
    },
    message: 'Profile updated successfully'
  });
});

// @desc    Change password
// @route   PUT /api/v1/auth/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Current password is incorrect'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    data: null,
    message: 'Password changed successfully'
  });
});

// @desc    Create admin user (Development only)
// @route   POST /api/v1/auth/create-admin
// @access  Public (Development only)
const createAdmin = asyncHandler(async (req, res) => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Admin creation not allowed in production'
      },
      timestamp: new Date().toISOString()
    });
  }

  const { name, email, password } = req.body;

  try {
    const admin = await User.createAdmin(email, password, name);
    const token = generateToken(admin._id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          isActive: admin.isActive,
          emailVerified: admin.emailVerified,
          createdAt: admin.createdAt
        },
        token
      },
      message: 'Admin user created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// @desc    Get all users (Admin only)
// @route   GET /api/v1/auth/users
// @access  Private (Admin)
const getUsers = asyncHandler(async (req, res) => {
  const { role, isActive, page = 1, limit = 20 } = req.query;

  // Build query
  const query = {};
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const users = await User.find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(limitNum)
    .select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken');

  const totalItems = await User.countDocuments(query);
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
      users,
      pagination
    },
    message: 'Users retrieved successfully'
  });
});

// @desc    Update user role (Admin only)
// @route   PUT /api/v1/auth/users/:id/role
// @access  Private (Admin)
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['user', 'agent', 'admin'].includes(role)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid role. Must be user, agent, or admin'
      },
      timestamp: new Date().toISOString()
    });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'User not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        updatedAt: user.updatedAt
      }
    },
    message: 'User role updated successfully'
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  createAdmin,
  getUsers,
  updateUserRole
};