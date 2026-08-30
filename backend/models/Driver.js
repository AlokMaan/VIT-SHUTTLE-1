const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Driver name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  licenseNo: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true
  },
  assignedShuttle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shuttle'
  },
  status: {
    type: String,
    enum: ['active', 'off_duty', 'on_leave'],
    default: 'active'
  },
  joinDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Driver', driverSchema);
