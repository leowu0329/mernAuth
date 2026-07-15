const mongoose = require('mongoose');

const SpecSchema = new mongoose.Schema({
  product_number: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  spec: {
    type: String,
    required: true,
    trim: true
  },
  version: {
    type: String,
    required: true,
    trim: true
  },
  inspec_time: {
    type: Number,
    required: true,
    min: [0, '檢驗工時必須大於或等於0'],
    // 透過 set 處理確保儲存至小數點後兩位
    set: v => parseFloat(Number(v).toFixed(2))
  }
}, { timestamps: true });

module.exports = mongoose.model('Spec', SpecSchema);