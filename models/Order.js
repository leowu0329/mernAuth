const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  order_number: { type: String, required: true, unique: true },
  product_number: { type: String, required: true },
  product_name: { type: String, required: true },
  quantity: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);