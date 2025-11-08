# Real Estate API

A comprehensive Node.js REST API for real estate management with property listings, contact forms, services, and admin functionality.

## 🚀 Features

- **Property Management**: Full CRUD operations for properties with advanced filtering and search
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Contact Management**: Contact form submissions with admin management
- **Services Management**: Service listings with categories and features
- **Advanced Search**: Filter by location, price range, category, type, and more
- **File Upload**: Support for property images and documents
- **Rate Limiting**: API protection with configurable rate limits
- **Comprehensive Validation**: Input validation and sanitization
- **Error Handling**: Structured error responses with detailed messages
- **Pagination**: Efficient data pagination for large datasets
- **Security**: Helmet.js, CORS, input sanitization, and more

## 📋 Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🛠️ Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Real_State_Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   # Using Docker
   docker run --name mongodb -d -p 27017:27017 mongo:latest
   
   # Or install MongoDB locally
   ```

5. **Seed the database** (optional)
   ```bash
   node utils/seedData.js
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   
   # Test with in-memory database
   node test-server.js
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/real_estate_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Admin User (for seeding)
ADMIN_EMAIL=admin@realestate.com
ADMIN_PASSWORD=admin123

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
All admin endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🔐 Authentication

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@realestate.com",
  "password": "admin123"
}
```

### Register (Admin only)
```http
POST /api/v1/auth/register
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "New User",
  "email": "user@example.com",
  "password": "password123",
  "role": "user"
}
```

## 🏠 Endpoints

### Properties

#### Get All Properties
```http
GET /api/v1/properties
```

**Query Parameters:**
- `type`: Filter by type (`Buy`, `Sell`, `Lease Out`)
- `category`: Filter by category (`Residential`, `Commercial`)
- `location`: Search by location
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Example:**
```http
GET /api/v1/properties?type=Buy&category=Residential&page=1&limit=10
```

#### Get Single Property
```http
GET /api/v1/properties/:id
```

#### Create Property (Admin Only)
```http
POST /api/v1/properties
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Modern Luxury Villa",
  "description": "Stunning contemporary villa...",
  "category": "Residential",
  "subcategory": "Villa",
  "location": "Beverly Hills, CA",
  "price": 4500000,
  "image": "https://example.com/image.jpg",
  "type": "Buy",
  "features": {
    "bedrooms": 5,
    "bathrooms": 4,
    "area": 4500,
    "areaUnit": "sqft"
  },
  "amenities": ["Swimming Pool", "Gym", "Garden"],
  "status": "Available"
}
```

#### Update Property (Admin Only)
```http
PUT /api/v1/properties/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "price": 4750000,
  "status": "Sold"
}
```

#### Delete Property (Admin Only)
```http
DELETE /api/v1/properties/:id
Authorization: Bearer <admin-token>
```

### Contact

#### Submit Contact Form
```http
POST /api/v1/contact
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "15551234567",
  "subject": "Property Inquiry",
  "message": "I'm interested in the property...",
  "propertyId": "property-id-here",
  "preferredContactMethod": "email"
}
```

#### Get All Contacts (Admin Only)
```http
GET /api/v1/contact
Authorization: Bearer <admin-token>
```

### Services

#### Get All Services
```http
GET /api/v1/services
```

#### Create Service (Admin Only)
```http
POST /api/v1/services
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "Property Management",
  "description": "Comprehensive property management services...",
  "icon": "building",
  "features": ["Tenant screening", "Rent collection"],
  "category": "Property Services",
  "price": 200,
  "priceType": "monthly"
}
```

## 🧪 Testing

### Run API Tests
```bash
# Start the test server (uses in-memory MongoDB)
node test-server.js

# In another terminal, run the test suite
node test-api.js
```

### Manual Testing with cURL

1. **Health Check**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Get Properties**
   ```bash
   curl "http://localhost:3000/api/v1/properties?limit=5"
   ```

3. **Login**
   ```bash
   curl -X POST "http://localhost:3000/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@realestate.com", "password": "admin123"}'
   ```

4. **Create Property**
   ```bash
   curl -X POST "http://localhost:3000/api/v1/properties" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "name": "Test Property",
       "description": "A test property",
       "category": "Residential",
       "subcategory": "House",
       "location": "Test City",
       "price": 500000,
       "type": "Buy",
       "image": "https://example.com/image.jpg",
       "features": {"bedrooms": 3, "bathrooms": 2, "area": 1500, "areaUnit": "sqft"}
     }'
   ```

## 🚀 Deployment

### Using Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and run**
   ```bash
   docker build -t real-estate-api .
   docker run -p 3000:3000 --env-file .env real-estate-api
   ```

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start server.js --name "real-estate-api"

# Monitor
pm2 monit

# Restart
pm2 restart real-estate-api
```

### Environment Setup

1. **Production Environment Variables**
   ```env
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=mongodb://your-production-db
   JWT_SECRET=your-super-secure-secret
   ```

2. **Database Setup**
   - Set up MongoDB Atlas or your preferred MongoDB hosting
   - Update `MONGODB_URI` in your environment variables
   - Run database seeding if needed

3. **Security Considerations**
   - Use HTTPS in production
   - Set up proper CORS origins
   - Configure rate limiting appropriately
   - Use strong JWT secrets
   - Enable MongoDB authentication

## 📁 Project Structure

```
Real_State_Backend/
├── controllers/          # Route controllers
│   ├── authController.js
│   ├── contactController.js
│   ├── propertyController.js
│   └── serviceController.js
├── middleware/           # Custom middleware
│   ├── auth.js
│   ├── errorHandler.js
│   └── validation.js
├── models/              # Database models
│   ├── Contact.js
│   ├── Property.js
│   ├── Service.js
│   └── User.js
├── routes/              # API routes
│   ├── auth.js
│   ├── contact.js
│   ├── properties.js
│   └── services.js
├── utils/               # Utility functions
│   └── seedData.js
├── uploads/             # File uploads directory
├── .env.example         # Environment variables template
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies and scripts
├── server.js           # Main server file
├── test-server.js      # Test server with in-memory DB
└── test-api.js         # API test suite
```

## 🔧 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": [
      {
        "field": "fieldName",
        "message": "Field-specific error message"
      }
    ]
  },
  "timestamp": "2024-01-26T10:15:00Z"
}
```

## 📊 Rate Limiting

| Endpoint Type | Rate Limit |
|--------------|------------|
| Public endpoints (GET) | 100 requests/minute |
| Contact form (POST) | 5 requests/hour per IP |
| Admin endpoints | 200 requests/minute |

## 🛡️ Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Input Validation**: Comprehensive data validation
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for password security
- **SQL Injection Protection**: MongoDB native protection
- **XSS Protection**: Input sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@realestate.com or create an issue in the repository.

## 🔄 Changelog

### v1.0.0
- Initial release
- Property management system
- Authentication and authorization
- Contact form functionality
- Services management
- Comprehensive API documentation
- Test suite implementation

---

**Built with ❤️ using Node.js, Express, and MongoDB**