import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
  generateVerificationCode,
} from '../utils/mailer.js';
import 'dotenv/config';

const router = express.Router();

// 註冊
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: '此信箱已被註冊' });
    }

    const verificationCode = generateVerificationCode();
    const user = await User.create({
      name,
      email,
      password,
      verificationCode,
      verificationCodeExpires: Date.now() + 600000, // 10 minutes
    });

    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      message: '註冊成功，請檢查信箱進行驗證',
      email: email,
    });
  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({ message: '註冊失敗' });
  }
});

// 新的驗證碼驗證路由
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: '驗證碼無效或已過期' });
    }

    user.verified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.json({ message: '信箱驗證成功' });
  } catch (error) {
    res.status(500).json({ message: '驗證失敗' });
  }
});

// 登入
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: '信箱或密碼錯誤' });
    }

    // 添加調試信息
    console.log('Creating JWT with secret:', process.env.JWT_SECRET);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // 驗證生成的 token
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verification successful');
    } catch (error) {
      console.error('Token verification failed:', error);
    }

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '登入失敗' });
  }
});

// 登出
router.post('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ message: '登出成功' });
});

// 檢查登入狀態
router.get('/check-auth', protect, (req, res) => {
  res.json({ user: req.user });
});

// 忘記密碼
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: '此信箱未註冊' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendResetPasswordEmail(user.email, resetToken);

    res.json({ message: '重設密碼信件已發送' });
  } catch (error) {
    res.status(500).json({ message: '發送重設密碼信件失敗' });
  }
});

// 重設密碼
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: '重設密碼連結無效或已過期' });
    }

    // 設置新密碼
    user.password = password;
    // 清除重設密碼的 token 和過期時間
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: '密碼重設成功' });
  } catch (error) {
    console.error('重設密碼錯誤:', error);
    res.status(500).json({ message: '密碼重設失敗' });
  }
});

// 已登入用戶重設密碼
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    // 驗證當前密碼
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: '當前密碼錯誤' });
    }

    // 設置新密碼
    user.password = newPassword;
    await user.save();

    res.json({ message: '密碼修改成功' });
  } catch (error) {
    console.error('修改密碼錯誤:', error);
    res.status(500).json({ message: '密碼修改失敗' });
  }
});

// 更新個人資料
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: '使用者不存在' });
    }

    // 只允許更新特定欄位
    const { name, birthday, address, idNumber } = req.body;

    // 如果要更新身分證字號，先檢查是否已被使用
    if (idNumber && idNumber !== user.idNumber) {
      const existingUser = await User.findOne({ idNumber });
      if (existingUser) {
        return res.status(400).json({ message: '此身分證字號已被使用' });
      }
    }

    // 更新欄位
    if (name) user.name = name;
    if (birthday) user.birthday = birthday;
    if (address) user.address = address;
    if (idNumber) user.idNumber = idNumber;

    await user.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        verified: user.verified,
        birthday: user.birthday,
        address: user.address,
        idNumber: user.idNumber,
      },
    });
  } catch (error) {
    console.error('更新個人資料錯誤:', error);
    res.status(500).json({ message: '更新個人資料失敗' });
  }
});

export default router;
