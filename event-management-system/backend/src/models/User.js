const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
  },
  college: {
    type: String,
    trim: true,
    maxlength: [100, 'College name cannot exceed 100 characters']
  },
  department: {
    type: String,
    trim: true,
    maxlength: [50, 'Department name cannot exceed 50 characters']
  },
  year: {
    type: String,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Post Graduate'],
  },
  city: {
    type: String,
    trim: true,
    maxlength: [50, 'City name cannot exceed 50 characters']
  },
  profileImage: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  registeredEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }]
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);



