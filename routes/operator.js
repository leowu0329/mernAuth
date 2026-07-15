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

// 批次匯入作業員
// routes/operator.js 部分修改
router.post('/import', auth, async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ msg: '資料格式錯誤，必須為陣列' });
    }

    const operations = req.body.map(item => {
      const { _id, __v, createdAt, updatedAt, operator_id, ...rest } = item; // 同步排除 operator_id
      
      return {
        updateOne: {
          filter: { name: rest.name }, // 改以姓名定位
          update: { $set: rest },
          upsert: true
        }
      };
    });

    if (operations.length > 0) {
      await Operator.bulkWrite(operations);
    }
    res.json({ msg: '匯入成功' });
  } catch (err) {
    console.error('Operator Import Error:', err);
    res.status(500).json({ msg: `匯入失敗: ${err.message}` });
  }
});

module.exports = router;