const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  icon: {
    type: String,
    required: [true, 'Service icon is required'],
    trim: true
  },
  features: [{
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Feature description cannot exceed 200 characters']
  }],
  category: {
    type: String,
    enum: ['Property Services', 'Financial Services', 'Legal Services', 'Consultation'],
    default: 'Property Services'
  },
  price: {
    type: Number,
    min: 0,
    default: 0
  },
  priceType: {
    type: String,
    enum: ['free', 'fixed', 'hourly', 'percentage', 'consultation'],
    default: 'consultation'
  },
  duration: {
    type: String,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    trim: true
  },
  contactInfo: {
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      trim: true
    }
  },
  requirements: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  availability: {
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    hours: {
      start: String,
      end: String
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  metadata: {
    views: {
      type: Number,
      default: 0
    },
    inquiries: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
serviceSchema.index({ active: 1, order: 1 });
serviceSchema.index({ category: 1, active: 1 });
serviceSchema.index({ featured: -1, order: 1 });
serviceSchema.index({ tags: 1 });

// Virtual for formatted price
serviceSchema.virtual('formattedPrice').get(function() {
  if (this.priceType === 'free') {
    return 'Free';
  } else if (this.priceType === 'consultation') {
    return 'Contact for pricing';
  } else if (this.price === 0) {
    return 'Contact for pricing';
  } else {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(this.price);
    
    switch (this.priceType) {
      case 'hourly':
        return `${formatted}/hour`;
      case 'percentage':
        return `${this.price}%`;
      default:
        return formatted;
    }
  }
});

// Pre-save middleware
serviceSchema.pre('save', function(next) {
  this.metadata.lastUpdated = new Date();
  next();
});

// Static method to get active services
serviceSchema.statics.getActiveServices = function() {
  return this.find({ active: true }).sort({ featured: -1, order: 1 });
};

// Static method to get services by category
serviceSchema.statics.getByCategory = function(category) {
  return this.find({ category, active: true }).sort({ order: 1 });
};

// Instance method to increment views
serviceSchema.methods.incrementViews = function() {
  this.metadata.views += 1;
  return this.save();
};

// Instance method to increment inquiries
serviceSchema.methods.incrementInquiries = function() {
  this.metadata.inquiries += 1;
  return this.save();
};

module.exports = mongoose.model('Service', serviceSchema);