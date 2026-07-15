const mongoose = require('mongoose');

const IpqcSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, required: true }, // HH:mm
  order_number: { type: String, required: true },
  operator: { type: String, default: '' },
  draw_ver: { type: String, default: '' },
  product_number: { type: String, required: true },
  product_name: { type: String, required: true },
  spec: { type: String, default: '' },
  quantity: { type: Number, default: 0 },
  inspector: { type: String, default: '' },
  determination: { type: String, default: '' },
  defect_classification: { type: String, default: '' },
  defect_status: { type: String, default: '' },
  handling_measures: { type: String, default: '' },
  remark: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Ipqc', IpqcSchema);