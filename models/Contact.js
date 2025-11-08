const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Allow empty phone or valid phone format
        return !v || /^[\+]?[1-9][\d]{0,15}$/.test(v.replace(/[\s\-\(\)]/g, ''));
      },
      message: 'Please provide a valid phone number'
    }
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters long'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: false
  },
  propertyName: {
    type: String,
    trim: true
  },
  preferredContactMethod: {
    type: String,
    enum: ['email', 'phone', 'both'],
    default: 'email'
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'resolved', 'spam'],
    default: 'pending'
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  source: {
    type: String,
    enum: ['website', 'mobile_app', 'api'],
    default: 'website'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  assignedTo: {
    type: String,
    trim: true
  },
  responseDate: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ propertyId: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ priority: 1, status: 1 });

// Virtual for response time (in hours)
contactSchema.virtual('responseTime').get(function() {
  if (this.responseDate && this.createdAt) {
    return Math.round((this.responseDate - this.createdAt) / (1000 * 60 * 60));
  }
  return null;
});

// Virtual for time since submission
contactSchema.virtual('timeSinceSubmission').get(function() {
  const now = new Date();
  const diffMs = now - this.createdAt;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  }
});

// Pre-save middleware to set priority based on keywords
contactSchema.pre('save', function(next) {
  if (this.isNew) {
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'emergency'];
    const highKeywords = ['important', 'priority', 'soon', 'quickly'];
    
    const messageText = (this.message + ' ' + (this.subject || '')).toLowerCase();
    
    if (urgentKeywords.some(keyword => messageText.includes(keyword))) {
      this.priority = 'urgent';
    } else if (highKeywords.some(keyword => messageText.includes(keyword))) {
      this.priority = 'high';
    }
    
    // Auto-tag based on content
    const tags = [];
    if (messageText.includes('viewing') || messageText.includes('visit')) {
      tags.push('viewing-request');
    }
    if (messageText.includes('price') || messageText.includes('cost')) {
      tags.push('pricing-inquiry');
    }
    if (messageText.includes('mortgage') || messageText.includes('financing')) {
      tags.push('financing');
    }
    if (messageText.includes('investment')) {
      tags.push('investment');
    }
    
    this.tags = [...new Set([...this.tags, ...tags])]; // Remove duplicates
  }
  next();
});

// Static method to get contact statistics
contactSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const totalContacts = await this.countDocuments();
  const avgResponseTime = await this.aggregate([
    {
      $match: { responseDate: { $exists: true } }
    },
    {
      $group: {
        _id: null,
        avgResponseTime: {
          $avg: {
            $divide: [
              { $subtract: ['$responseDate', '$createdAt'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      }
    }
  ]);
  
  return {
    total: totalContacts,
    byStatus: stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {}),
    averageResponseTime: avgResponseTime[0]?.avgResponseTime || 0
  };
};

// Instance method to mark as contacted
contactSchema.methods.markAsContacted = function(notes) {
  this.status = 'contacted';
  this.responseDate = new Date();
  if (notes) {
    this.notes = notes;
  }
  return this.save();
};

module.exports = mongoose.model('Contact', contactSchema);