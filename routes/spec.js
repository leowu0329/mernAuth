const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Spec = require('../models/Spec');

router.get('/', auth, async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { product_number: { $regex: search, $options: 'i' } },
        { spec: { $regex: search, $options: 'i' } }
      ];
    }
    const count = await Spec.countDocuments(query);
    const data = await Spec.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    res.json({ total: count, data });
  } catch (err) {
    res.status(500).json({ msg: '讀取規格列表失敗' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const entry = new Spec(req.body);
    await entry.save();
    res.json(entry);
  } catch (err) {
    res.status(500).json({ msg: '新增失敗' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const entry = await Spec.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ msg: '修改失敗' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Spec.findByIdAndDelete(req.params.id);
    res.json({ msg: '刪除成功' });
  } catch (err) {
    res.status(500).json({ msg: '刪除失敗' });
  }
});

router.post('/import', auth, async (req, res) => {
  try {
    await Spec.insertMany(req.body);
    res.json({ msg: '匯入成功' });
  } catch (err) {
    res.status(500).json({ msg: '匯入失敗' });
  }
});

module.exports = router;