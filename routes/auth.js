const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Profile = require('../models/Profile');

// 1. 註冊 (預設為未驗證 isVerified: false)
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: '此信箱已被註冊' });

    user = new User({ username, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // 初始化 Profile 檔案
    const newProfile = new Profile({
      email: user.email,
      username: user.username
    });
    await newProfile.save();

    res.status(200).json({ msg: '註冊成功！請進行信箱驗證（將 isVerified 啟用）。' });
  } catch (err) {
    res.status(500).json({ msg: '伺服器錯誤' });
  }
});

// 2. 信箱驗證 (啟用 isVerified)
router.post('/verify-email', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: '找不到此電子信箱對應的用戶' });
    
    user.isVerified = true;
    await user.save();
    res.status(200).json({ msg: '電子信箱驗證成功！現在可以登入了。' });
  } catch (err) {
    res.status(500).json({ msg: '伺服器錯誤' });
  }
});

// 3. 登入
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: '帳號或密碼錯誤' });
    if (!user.isVerified) return res.status(400).json({ msg: '帳號未驗證，請先驗證您的信箱！' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: '帳號或密碼錯誤' });

    const profile = await Profile.findOne({ email });
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        nickname: profile ? profile.nickname : user.username
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: payload.user });
    });
  } catch (err) {
    res.status(500).json({ msg: '伺服器錯誤' });
  }
});

// 4. 忘記密碼 (模擬重新設置為預設密碼 "123456")
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: '找不到此電子信箱' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash('123456', salt);
    await user.save();
    res.status(200).json({ msg: '密碼重設成功！新預設密碼為: 123456，請儘速登入修改。' });
  } catch (err) {
    res.status(500).json({ msg: '伺服器錯誤' });
  }
});

// 5. 獲取個人資訊
router.get('/profile', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ email: req.user.email });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ msg: '讀取個人資料失敗' });
  }
});

// 6. 更新個人資訊
router.put('/profile', auth, async (req, res) => {
  const { username, nickname, birthday, id_card, mobile, factory, department, job_title, role_type, address } = req.body;
  try {
    const updateFields = { username, nickname, birthday, id_card, mobile, factory, department, job_title, role_type, address };
    let profile = await Profile.findOneAndUpdate(
      { email: req.user.email },
      { $set: updateFields },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ msg: '更新個人資料失敗' });
  }
});

// 7. 變更密碼
router.put('/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: '目前密碼輸入錯誤' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.status(200).json({ msg: '密碼更新成功！' });
  } catch (err) {
    res.status(500).json({ msg: '更新密碼時伺服器出錯' });
  }
});

module.exports = router;