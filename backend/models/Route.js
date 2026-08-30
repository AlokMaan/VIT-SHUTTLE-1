const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Route code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Route name is required'],
    trim: true
  },
  color: {
    type: String,
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color']
  },
  description: {
    type: String,
    trim: true
  },
  path: [{
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }],
  pathGeoJSON: {
    type: mongoose.Schema.Types.Mixed
  },
  isActive: {
    type: Boolean,
    default: true
  },
  operatingHours: {
    start: { type: String },
    end: { type: String }
  },
  frequency: {
    type: Number,
    min: [1, 'Frequency must be at least 1 minute']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Route', routeSchema);
