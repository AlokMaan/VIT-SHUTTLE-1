const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: [true, 'Setting key is required'],
    unique: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed
  },
  category: {
    type: String,
    enum: ['general', 'map', 'features', 'branding', 'notifications']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

adminSettingsSchema.statics.getSetting = async function(key) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : null;
};

adminSettingsSchema.statics.setSetting = async function(key, value, adminId) {
  let setting = await this.findOne({ key });
  if (setting) {
    setting.value = value;
    setting.updatedBy = adminId;
    await setting.save();
  } else {
    setting = await this.create({ key, value, updatedBy: adminId });
  }
  return setting;
};

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);
