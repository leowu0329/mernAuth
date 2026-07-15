const mongoose = require('mongoose');

const DefectSchema = new mongoose.Schema({
  defect_code: { type: String, required: true, unique: true },
  defect_type: { type: String, required: true },
  description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Defect', DefectSchema);