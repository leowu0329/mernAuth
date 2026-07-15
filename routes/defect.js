const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Defect = require('../models/Defect');

router.get('/', auth, async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { defect_code: { $regex: search, $options: 'i' } },
        { defect_type: { $regex: search, $options: 'i' } }
      ];
    }
    const count = await Defect.countDocuments(query);
    const data = await Defect.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    res.json({ total: count, data });
  } catch (err) {
    res.status(500).json({ msg: '讀取不良清單失敗' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const entry = new Defect(req.body);
    await entry.save();
    res.json(entry);
  } catch (err) {
    res.status(500).json({ msg: '新增失敗' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const entry = await Defect.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ msg: '修改失敗' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Defect.findByIdAndDelete(req.params.id);
    res.json({ msg: '刪除成功' });
  } catch (err) {
    res.status(500).json({ msg: '刪除失敗' });
  }
});

// 批次匯入缺陷代碼
router.post('/import', auth, async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ msg: '資料格式錯誤，必須為陣列' });
    }

    const operations = req.body.map(item => {
      const { _id, __v, createdAt, updatedAt, defect_code, ...rest } = item; // 同步排除 defect_code
      
      return {
        updateOne: {
          filter: { defect_type: rest.defect_type }, // 改以缺陷分類定位
          update: { $set: rest },
          upsert: true
        }
      };
    });

    if (operations.length > 0) {
      await Defect.bulkWrite(operations);
    }
    res.json({ msg: '匯入成功' });
  } catch (err) {
    console.error('Defect Import Error:', err);
    res.status(500).json({ msg: `匯入失敗: ${err.message}` });
  }
});

module.exports = router;