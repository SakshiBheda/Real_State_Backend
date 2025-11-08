const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const propertyRoutes = require('./routes/properties');
const contactRoutes = require('./routes/contact');
const serviceRoutes = require('./routes/services');
const authRoutes = require('./routes/auth');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS === '*' ? true : process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Contact form specific rate limiting
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour per IP
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many contact form submissions from this IP, please try again later.'
    }
  }
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Real Estate API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API documentation endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Real Estate API',
    version: '1.0.0',
    documentation: {
      health: '/health',
      properties: '/api/v1/properties',
      services: '/api/v1/services',
      contact: '/api/v1/contact',
      auth: '/api/v1/auth'
    },
    endpoints: {
      'GET /api/v1/properties': 'Get all properties with filtering',
      'GET /api/v1/properties/:id': 'Get single property',
      'POST /api/v1/properties': 'Create property (Admin)',
      'PUT /api/v1/properties/:id': 'Update property (Admin)',
      'DELETE /api/v1/properties/:id': 'Delete property (Admin)',
      'GET /api/v1/services': 'Get all services',
      'POST /api/v1/contact': 'Submit contact form',
      'POST /api/v1/auth/login': 'Admin login'
    },
    adminCredentials: process.env.NODE_ENV === 'development' ? {
      email: 'admin@realestate.com',
      password: 'admin123'
    } : 'Contact administrator'
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/contact', contactLimiter, contactRoutes);
app.use('/api/v1/services', serviceRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.originalUrl} not found`
    },
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use(errorHandler);

// Start server function
const startServer = async () => {
  try {
    // Database connection
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real_estate_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    
    // Start server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Real Estate API server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
        mongoose.connection.close();
      });
    });
    
    return server;
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Start server only if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;