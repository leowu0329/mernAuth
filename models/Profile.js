const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  nickname: { type: String, default: '' },
  birthday: { type: Date, default: null },
  id_card: { type: String, default: '' },
  mobile: { type: String, default: '' },
  factory: { type: String, default: '' },
  department: { type: String, default: '' },
  job_title: { type: String, default: '' },
  role_type: { type: String, default: '' },
  address: { type: String, default: '' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Profile', ProfileSchema);