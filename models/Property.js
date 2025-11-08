const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    default: 'USA',
    trim: true
  },
  coordinates: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  }
});

const featuresSchema = new mongoose.Schema({
  bedrooms: {
    type: Number,
    min: 0,
    default: 0
  },
  bathrooms: {
    type: Number,
    min: 0,
    default: 0
  },
  area: {
    type: Number,
    required: true,
    min: 1
  },
  areaUnit: {
    type: String,
    enum: ['sqft', 'sqm'],
    default: 'sqft'
  },
  parkingSpaces: {
    type: Number,
    min: 0,
    default: 0
  },
  yearBuilt: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear() + 5
  },
  floors: {
    type: Number,
    min: 1,
    default: 1
  }
});

const agentSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  photo: {
    type: String,
    trim: true
  }
});

const propertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Property name is required'],
    trim: true,
    maxlength: [200, 'Property name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Property description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Residential', 'Commercial'],
      message: 'Category must be either Residential or Commercial'
    }
  },
  subcategory: {
    type: String,
    required: [true, 'Subcategory is required'],
    validate: {
      validator: function(value) {
        const residentialTypes = ['House', 'Villa', 'Apartment', 'Penthouse', 'Condo', 'Townhouse'];
        const commercialTypes = ['Office Building', 'Retail Space', 'Warehouse', 'Industrial', 'Mixed-Use'];
        
        if (this.category === 'Residential') {
          return residentialTypes.includes(value);
        } else if (this.category === 'Commercial') {
          return commercialTypes.includes(value);
        }
        return false;
      },
      message: 'Invalid subcategory for the selected category'
    }
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  address: {
    type: addressSchema,
    required: false
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive number']
  },
  priceFormatted: {
    type: String
  },
  image: {
    type: String,
    required: [true, 'Main image is required'],
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  type: {
    type: String,
    required: [true, 'Property type is required'],
    enum: {
      values: ['Buy', 'Sell', 'Lease Out'],
      message: 'Type must be Buy, Sell, or Lease Out'
    }
  },
  features: {
    type: featuresSchema,
    required: true
  },
  amenities: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['Available', 'Pending', 'Sold', 'Rented', 'Off Market'],
    default: 'Available'
  },
  featured: {
    type: Boolean,
    default: false
  },
  agent: {
    type: agentSchema,
    required: false
  },
  agentId: {
    type: Number,
    required: false
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
propertySchema.index({ category: 1, type: 1 });
propertySchema.index({ location: 'text', name: 'text', description: 'text' });
propertySchema.index({ price: 1 });
propertySchema.index({ featured: -1, createdAt: -1 });
propertySchema.index({ status: 1 });

// Virtual for formatted price
propertySchema.virtual('formattedPrice').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(this.price);
});

// Pre-save middleware to format price
propertySchema.pre('save', function(next) {
  if (this.price) {
    this.priceFormatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(this.price);
  }
  next();
});

// Static method to get property types
propertySchema.statics.getPropertyTypes = function() {
  return ['Buy', 'Sell', 'Lease Out'];
};

// Static method to get categories
propertySchema.statics.getCategories = function() {
  return ['Residential', 'Commercial'];
};

// Static method to get subcategories
propertySchema.statics.getSubcategories = function() {
  return {
    Residential: ['House', 'Villa', 'Apartment', 'Penthouse', 'Condo', 'Townhouse'],
    Commercial: ['Office Building', 'Retail Space', 'Warehouse', 'Industrial', 'Mixed-Use']
  };
};

// Instance method to increment views
propertySchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model('Property', propertySchema);