const mongoose = require('mongoose');

const OperatorSchema = new mongoose.Schema({
  operator_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Operator', OperatorSchema);