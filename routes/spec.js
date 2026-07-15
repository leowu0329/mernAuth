const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Spec = require('../models/Spec');

// 輔助函式：安全跳脫正規表示法中的特殊字元 (例如: -, /, *, +, ?, ., (, ) 等)
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// 取得規格列表 (支援分頁、安全模糊查詢、品號精準比對)
router.get('/', auth, async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    let query = {};

    if (search) {
      // 安全跳脫特殊字元
      const safeSearch = escapeRegex(search.trim());

      // 優先支援：1. 品號完全吻合（Exact Match） OR 2. 品號與規格的模糊包含匹配（Regex Match）
      query.$or = [
        { product_number: search.trim() }, // 精準比對 (最適用於前端自動聯動)
        { product_number: { $regex: safeSearch, $options: 'i' } }, // 模糊比對
        { spec: { $regex: safeSearch, $options: 'i' } } // 規格模糊比對
      ];
    }

    const count = await Spec.countDocuments(query);
    const data = await Spec.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
      
    res.json({ total: count, data });
  } catch (err) {
    console.error('讀取規格列表失敗:', err);
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

// 批次更新/覆蓋匯入規格 (Upsert 模式)
router.post('/import', auth, async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ msg: '資料格式錯誤，必須為陣列' });
    }

    const operations = req.body.map(item => {
      const { _id, __v, createdAt, updatedAt, ...rest } = item;
      
      // 確保傳入的工時格式為正浮點數
      if (rest.inspec_time !== undefined) {
        rest.inspec_time = parseFloat(Number(rest.inspec_time).toFixed(2)) || 0;
      }

      return {
        updateOne: {
          filter: { product_number: rest.product_number }, // 用關聯品號作為 Unique key 進行覆蓋
          update: { $set: rest },
          upsert: true
        }
      };
    });

    if (operations.length > 0) {
      await Spec.bulkWrite(operations);
    }
    res.json({ msg: '匯入成功' });
  } catch (err) {
    console.error('Spec Import Error:', err);
    res.status(500).json({ msg: `匯入失敗: ${err.message}` });
  }
});

module.exports = router;