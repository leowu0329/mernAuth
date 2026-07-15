const mongoose = require('mongoose');

const SpecSchema = new mongoose.Schema({
  product_number: { type: String, required: true, unique: true },
  spec: { type: String, required: true },
  version: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Spec', SpecSchema);