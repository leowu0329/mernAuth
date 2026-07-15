const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');

router.get('/', auth, async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { order_number: { $regex: search, $options: 'i' } },
        { product_number: { $regex: search, $options: 'i' } },
        { product_name: { $regex: search, $options: 'i' } }
      ];
    }
    const count = await Order.countDocuments(query);
    const data = await Order.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    res.json({ total: count, data });
  } catch (err) {
    res.status(500).json({ msg: '讀取工單失敗' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const entry = new Order(req.body);
    await entry.save();
    res.json(entry);
  } catch (err) {
    res.status(500).json({ msg: '新增失敗' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const entry = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ msg: '修改失敗' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ msg: '刪除成功' });
  } catch (err) {
    res.status(500).json({ msg: '刪除失敗' });
  }
});

router.post('/import', auth, async (req, res) => {
  try {
    await Order.insertMany(req.body);
    res.json({ msg: '匯入成功' });
  } catch (err) {
    res.status(500).json({ msg: '匯入失敗' });
  }
});

module.exports = router;