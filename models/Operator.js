const mongoose = require('mongoose');

const OperatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // 調整為姓名唯一
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Operator', OperatorSchema);