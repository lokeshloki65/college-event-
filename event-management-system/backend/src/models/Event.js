const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    maxlength: [100, 'Event name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    maxlength: [50, 'Department name cannot exceed 50 characters']
  },
  college: {
    type: String,
    required: [true, 'College is required'],
    default: 'Kongu Engineering College'
  },
  posterImage: {
    public_id: String,
    url: {
      type: String,
      required: [true, 'Poster image is required']
    }
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required']
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true,
    maxlength: [200, 'Venue cannot exceed 200 characters']
  },
  maxParticipants: {
    type: Number,
    default: null // null means unlimited
  },
  registrationFee: {
    type: Number,
    default: 0,
    min: [0, 'Registration fee cannot be negative']
  },
  paymentQR: {
    public_id: String,
    url: String
  },
  paymentDetails: {
    upiId: String,
    phoneNumber: String
  },
  instructions: {
    type: String,
    maxlength: [1000, 'Instructions cannot exceed 1000 characters']
  },
  registrationType: {
    type: String,
    enum: ['individual', 'team', 'both'],
    default: 'individual'
  },
  teamSize: {
    min: {
      type: Number,
      default: 1
    },
    max: {
      type: Number,
      default: 1
    }
  },
  customFields: [{
    fieldName: {
      type: String,
      required: true
    },
    fieldType: {
      type: String,
      enum: ['text', 'number', 'email', 'phone', 'textarea'],
      default: 'text'
    },
    required: {
      type: Boolean,
      default: false
    },
    placeholder: String
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  whatsappGroupLink: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalRegistrations: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
eventSchema.index({ status: 1 });
eventSchema.index({ department: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ registrationDeadline: 1 });
eventSchema.index({ createdBy: 1 });

// Virtual for checking if registration is open
eventSchema.virtual('isRegistrationOpen').get(function() {
  const now = new Date();
  return now <= this.registrationDeadline && this.status === 'upcoming';
});

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  if (this.maxParticipants === null) return false;
  return this.totalRegistrations >= this.maxParticipants;
});

// Pre-save middleware to update status based on dates
eventSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.endDate < now) {
    this.status = 'completed';
  } else if (this.startDate <= now && this.endDate >= now) {
    this.status = 'ongoing';
  } else if (this.startDate > now) {
    this.status = 'upcoming';
  }
  
  next();
});

// Method to check if user can register
eventSchema.methods.canRegister = function() {
  const now = new Date();
  return (
    this.isActive &&
    this.status === 'upcoming' &&
    now <= this.registrationDeadline &&
    (this.maxParticipants === null || this.totalRegistrations < this.maxParticipants)
  );
};

module.exports = mongoose.model('Event', eventSchema);
