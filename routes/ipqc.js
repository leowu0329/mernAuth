const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Ipqc = require('../models/Ipqc');

// 取得 IPQC 列表 (支援分頁、關鍵字搜尋、日期起迄篩選、排序)
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', startDate = '', endDate = '' } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { order_number: { $regex: search, $options: 'i' } },
        { product_number: { $regex: search, $options: 'i' } },
        { product_name: { $regex: search, $options: 'i' } },
        { operator: { $regex: search, $options: 'i' } },
        { inspector: { $regex: search, $options: 'i' } },
        { defect_classification: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const count = await Ipqc.countDocuments(query);
    const data = await Ipqc.find(query)
      .sort({ date: -1, time: -1 }) // 日期與時間遞減排序
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({ total: count, data });
  } catch (err) {
    res.status(500).json({ msg: '無法取得IPQC資料' });
  }
});

// 建立、批次匯入、更新與刪除等 CURD API
router.post('/', auth, async (req, res) => {
  try {
    const newRecord = new Ipqc(req.body);
    const saved = await newRecord.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ msg: '新增資料失敗' });
  }
});

router.post('/import', auth, async (req, res) => {
  try {
    const records = req.body; // 陣列格式
    if (!Array.isArray(records)) return res.status(400).json({ msg: '資料格式不正確' });
    const saved = await Ipqc.insertMany(records);
    res.json({ msg: `成功匯入 ${saved.length} 筆資料` });
  } catch (err) {
    res.status(500).json({ msg: '匯入失敗' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Ipqc.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: '更新資料失敗' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Ipqc.findByIdAndDelete(req.params.id);
    res.json({ msg: '刪除成功' });
  } catch (err) {
    res.status(500).json({ msg: '刪除資料失敗' });
  }
});

module.exports = router;