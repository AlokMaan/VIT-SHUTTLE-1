const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [60, 'Name too long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@(vitstudent\.ac\.in|vit\.ac\.in)$/, 'Only @vit.ac.in or @vitstudent.ac.in emails are allowed']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  regNo: {
    type: String,
    trim: true,
    uppercase: true,
    sparse: true
  },
  phone: { type: String, trim: true },
  avatar: { type: String, default: '' },
  department: { type: String, default: '' },
  year: { type: Number, min: 1, max: 5 },
  hostel: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: { type: Date },
  // OTPs are stored as a keyed hash, never as the readable code itself.
  otpHash: { type: String, select: false },
  otpExpire: { type: Date },
  totalRides: { type: Number, default: 0 },
  // Shuttle Card
  cardNumber: { type: String },
  cardCvv: { type: String },
  cardExpiry: { type: String },
  cardBalance: { type: Number, default: 0 },
  cardTransactions: [{
    type: { type: String, enum: ['credit', 'debit'], default: 'credit' },
    amount: { type: Number, required: true },
    desc: { type: String },
    date: { type: Date, default: Date.now },
    paymentId: { type: String }
  }],
  notifications: [{
    message: String,
    type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT
userSchema.methods.generateToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate Reset Token
userSchema.methods.generateResetToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
