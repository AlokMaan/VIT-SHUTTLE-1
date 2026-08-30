const mongoose = require('mongoose');

const gpsLogSchema = new mongoose.Schema({
  shuttle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shuttle'
  },
  busId: {
    type: String,
    index: true
  },
  location: {
    lat: Number,
    lng: Number
  },
  speed: Number,
  heading: Number,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  },
  isSimulated: {
    type: Boolean,
    default: true
  }
});

// TTL index to auto-delete logs older than 90 days
gpsLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('GpsLog', gpsLogSchema);
