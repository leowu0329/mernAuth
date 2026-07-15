const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Operator = require('../models/Operator');

router.get('/', auth, async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { operator_id: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }
    const count = await Operator.countDocuments(query);
    const data = await Operator.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    res.json({ total: count, data });
  } catch (err) {
    res.status(500).json({ msg: '讀取人員檔案失敗' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const entry = new Operator(req.body);
    await entry.save();
    res.json(entry);
  } catch (err) {
    res.status(500).json({ msg: '新增失敗' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const entry = await Operator.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ msg: '修改失敗' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Operator.findByIdAndDelete(req.params.id);
    res.json({ msg: '刪除成功' });
  } catch (err) {
    res.status(500).json({ msg: '刪除失敗' });
  }
});

router.post('/import', auth, async (req, res) => {
  try {
    await Operator.insertMany(req.body);
    res.json({ msg: '匯入成功' });
  } catch (err) {
    res.status(500).json({ msg: '匯入失敗' });
  }
});

module.exports = router;