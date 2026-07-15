const mongoose = require('mongoose');

const DefectSchema = new mongoose.Schema({
  defect_type: {
    type: String,
    required: true,
    unique: true, // 調整為分類名稱唯一
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Defect', DefectSchema);