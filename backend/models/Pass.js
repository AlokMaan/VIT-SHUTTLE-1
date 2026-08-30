const mongoose = require('mongoose');

const passSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'monthly', 'yearly'],
    required: [true, 'Pass type is required']
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  qrCode: {
    type: String,
    unique: true,
    required: true
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  ridesUsed: { type: Number, default: 0 },
  lastUsed: { type: Date }
}, {
  timestamps: true
});

// Auto-update status if expired
// passSchema.pre('find', function() {
//   this.where({ endDate: { $gte: new Date() } }).or([{ status: 'active' }]);
// });

passSchema.virtual('isActive').get(function() {
  return this.status === 'active' && this.endDate >= new Date();
});

passSchema.virtual('daysRemaining').get(function() {
  if (this.status !== 'active') return 0;
  const diff = this.endDate - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

passSchema.set('toJSON', { virtuals: true });
passSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Pass', passSchema);
