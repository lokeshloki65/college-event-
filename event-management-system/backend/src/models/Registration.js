const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  registrationType: {
    type: String,
    enum: ['individual', 'team'],
    required: [true, 'Registration type is required']
  },
  // Team Information (for team registrations)
  teamName: {
    type: String,
    trim: true,
    maxlength: [100, 'Team name cannot exceed 100 characters']
  },
  teamMembers: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Team member name cannot exceed 50 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    college: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    year: {
      type: String,
      trim: true
    }
  }],
  // Contact Information
  contactDetails: {
    primaryPhone: {
      type: String,
      required: [true, 'Primary phone number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
    },
    alternatePhone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    }
  },
  // Academic Information
  academicDetails: {
    college: {
      type: String,
      required: [true, 'College is required'],
      trim: true,
      maxlength: [100, 'College name cannot exceed 100 characters']
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      maxlength: [50, 'Department name cannot exceed 50 characters']
    },
    year: {
      type: String,
      required: [true, 'Year is required']
    },
    rollNumber: {
      type: String,
      trim: true,
      maxlength: [20, 'Roll number cannot exceed 20 characters']
    }
  },
  // Location Information
  location: {
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [50, 'City name cannot exceed 50 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'State name cannot exceed 50 characters']
    },
    pincode: {
      type: String,
      trim: true,
      match: [/^\d{6}$/, 'Please provide a valid 6-digit pincode']
    }
  },
  // Payment Information
  paymentDetails: {
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Payment amount cannot be negative']
    },
    transactionId: {
      type: String,
      trim: true,
      maxlength: [100, 'Transaction ID cannot exceed 100 characters']
    },
    paymentScreenshot: {
      public_id: String,
      url: {
        type: String,
        required: [true, 'Payment screenshot is required']
      }
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    }
  },
  // Custom Fields (dynamic based on event)
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  // Additional Information
  specialRequirements: {
    type: String,
    maxlength: [500, 'Special requirements cannot exceed 500 characters']
  },
  emergencyContact: {
    name: {
      type: String,
      trim: true,
      maxlength: [50, 'Emergency contact name cannot exceed 50 characters']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
    },
    relation: {
      type: String,
      trim: true,
      maxlength: [20, 'Relation cannot exceed 20 characters']
    }
  },
  // Registration Status
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'approved', 'rejected', 'cancelled'],
    default: 'submitted'
  },
  registrationNumber: {
    type: String,
    unique: true
  },
  // Admin Notes
  adminNotes: {
    type: String,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  // Timestamps
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
registrationSchema.index({ event: 1 });
registrationSchema.index({ user: 1 });
registrationSchema.index({ status: 1 });
registrationSchema.index({ registrationNumber: 1 });
registrationSchema.index({ 'paymentDetails.paymentStatus': 1 });

// Compound indexes
registrationSchema.index({ event: 1, user: 1 }, { unique: true });

// Pre-save middleware to generate registration number
registrationSchema.pre('save', async function(next) {
  if (this.isNew && !this.registrationNumber) {
    try {
      // Generate registration number: EVT-YYYY-MM-DD-XXXX
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      // Count registrations for today to generate sequence number
      const today = new Date(year, date.getMonth(), date.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const count = await mongoose.model('Registration').countDocuments({
        createdAt: {
          $gte: today,
          $lt: tomorrow
        }
      });
      
      const sequence = String(count + 1).padStart(4, '0');
      this.registrationNumber = `EVT-${year}-${month}-${day}-${sequence}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to check if registration can be cancelled
registrationSchema.methods.canCancel = function() {
  const now = new Date();
  // Allow cancellation if event hasn't started and registration is approved
  return this.status === 'approved' && this.event.startDate > now;
};

module.exports = mongoose.model('Registration', registrationSchema);
