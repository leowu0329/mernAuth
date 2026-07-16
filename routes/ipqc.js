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
  // 🔍 【後端日誌 C】: 檢查後端是否成功解析 JSON 陣列
  console.log("📥 [後端] 1. 收到 /import 請求");
  console.log("📥 [後端] 2. req.body 類型:", typeof req.body);
  console.log("📥 [後端] 3. req.body 是否為陣列:", Array.isArray(req.body));
  console.log("📥 [後端] 4. 接收到的資料內容 (前一筆):", req.body ? req.body[0] : "無資料");

  try {
    const records = req.body; // 陣列格式
    if (!Array.isArray(records)) {
      console.warn("⚠️ [後端] 接收到的資料格式非陣列，退回請求");
      return res.status(400).json({ msg: '資料格式不正確' });
    }

    const saved = await Ipqc.insertMany(records);
    console.log(`✅ [後端] 5. 成功寫入資料庫 ${saved.length} 筆`);
    res.json({ msg: `成功匯入 ${saved.length} 筆資料` });
  } catch (err) {
    // 🔍 【後端日誌 D】: 檢查資料庫寫入失敗的具體原因 (欄位驗證錯誤等)
    console.error("❌ [後端] 6. 匯入資料庫失敗，原因:", err);
    res.status(500).json({ msg: '匯入失敗: ' + err.message });
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