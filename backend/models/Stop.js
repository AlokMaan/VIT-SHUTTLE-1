const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Stop name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Stop code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  geofenceRadius: {
    type: Number,
    default: 50
  },
  routes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  }],
  amenities: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Stop', stopSchema);
