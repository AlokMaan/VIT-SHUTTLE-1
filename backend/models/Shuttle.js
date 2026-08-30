const mongoose = require('mongoose');

const shuttleSchema = new mongoose.Schema({
  busId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: { type: String, required: true },
  route: {
    name: { type: String, required: true },
    code: { type: String, required: true },
    color: { type: String, default: '#1d72c8' },
    stops: [{ name: String, lat: Number, lng: Number, order: Number }]
  },
  driver: {
    name: { type: String },
    phone: { type: String },
    licenseNo: { type: String }
  },
  capacity: { type: Number, default: 40 },
  currentOccupancy: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['active', 'idle', 'maintenance', 'out_of_service'],
    default: 'idle'
  },
  location: {
    lat: { type: Number, default: 12.9716 },
    lng: { type: Number, default: 79.1589 }
  },
  currentRoute: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  speed: { type: Number, default: 0 },
  nextStop: { type: String },
  eta: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  isAC: { type: Boolean, default: false },
  registrationNo: { type: String },
  manufactureYear: { type: Number }
}, {
  timestamps: true
});

shuttleSchema.virtual('occupancyPercent').get(function() {
  return Math.round((this.currentOccupancy / this.capacity) * 100);
});

shuttleSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Shuttle', shuttleSchema);
