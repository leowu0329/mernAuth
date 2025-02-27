// 引入必要的模組
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

// 建立 Express Router 實例
const router = express.Router();

// 使用者註冊路由
router.post('/register', async (req, res) => {
  try {
    // 從請求中獲取使用者資料
    const { name, email, password } = req.body;

    // 檢查信箱是否已被註冊
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: '此信箱已被註冊' });
    }

    // 生成驗證碼並建立新使用者
    const verificationCode = generateVerificationCode();
    const user = await User.create({
      name,
      email,
      password,
      verificationCode,
      verificationCodeExpires: Date.now() + 600000, // 10分鐘後過期
    });

    // 發送驗證信件
    await sendVerificationEmail(email, verificationCode);

    // 回傳註冊成功訊息
    res.status(201).json({
      message: '註冊成功，請檢查信箱進行驗證',
      email: email,
    });
  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({ message: '註冊失敗' });
  }
});

// 信箱驗證路由
router.post('/verify-email', async (req, res) => {
  try {
    // 從請求中獲取信箱和驗證碼
    const { email, code } = req.body;
    console.log('Verification attempt:', { email, code }); // 添加調試日誌

    // 查找符合條件的使用者
    const user = await User.findOne({
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() }, // 確認驗證碼未過期
    });

    console.log('Found user:', user); // 添加調試日誌

    if (!user) {
      return res.status(400).json({ message: '驗證碼無效或已過期' });
    }

    // 更新使用者狀態
    user.verified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.json({ message: '信箱驗證成功' });
  } catch (error) {
    console.error('驗證錯誤:', error); // 添加錯誤日誌
    res.status(500).json({ message: '驗證失敗' });
  }
});

// 使用者登入路由
router.post('/login', async (req, res) => {
  try {
    // 從請求中獲取登入資訊
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // 驗證使用者帳號密碼
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: '信箱或密碼錯誤' });
    }

    // 記錄 JWT 建立過程
    console.log('Creating JWT with secret:', process.env.JWT_SECRET);

    // 建立 JWT token
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

    // 設置 cookie
    res.cookie('token', token, {
      httpOnly: true, // 防止 JavaScript 訪問
      secure: process.env.NODE_ENV === 'production', // 在生產環境使用 HTTPS
      sameSite: 'strict', // 防止 CSRF 攻擊
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie 有效期 7 天
    });

    // 回傳使用者資訊
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

// 使用者登出路由
router.post('/logout', (req, res) => {
  // 清除 cookie
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ message: '登出成功' });
});

// 檢查使用者登入狀態路由
router.get('/check-auth', protect, (req, res) => {
  res.json({ user: req.user });
});

// 忘記密碼路由
router.post('/forgot-password', async (req, res) => {
  try {
    // 查找使用者
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: '此信箱未註冊' });
    }

    // 生成重設密碼 token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1小時後過期
    await user.save();

    // 發送重設密碼信件
    await sendResetPasswordEmail(user.email, resetToken);

    res.json({ message: '重設密碼信件已發送' });
  } catch (error) {
    res.status(500).json({ message: '發送重設密碼信件失敗' });
  }
});

// 重設密碼路由
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // 查找符合條件的使用者
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // 確認 token 未過期
    });

    if (!user) {
      return res.status(400).json({ message: '重設密碼連結無效或已過期' });
    }

    // 更新密碼並清除重設 token
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: '密碼重設成功' });
  } catch (error) {
    console.error('重設密碼錯誤:', error);
    res.status(500).json({ message: '密碼重設失敗' });
  }
});

// 修改密碼路由
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    console.log('Change password attempt for user:', req.user.email); // 添加調試日誌

    // 獲取完整的用戶資料（包含密碼）
    const user = await User.findById(req.user._id);

    // 驗證當前密碼
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      console.log('Current password verification failed'); // 添加調試日誌
      return res.status(400).json({ message: '當前密碼錯誤' });
    }

    // 更新密碼
    user.password = newPassword;
    await user.save();

    console.log('Password updated successfully'); // 添加調試日誌
    res.json({ message: '密碼修改成功' });
  } catch (error) {
    console.error('Change password error:', error); // 添加錯誤日誌
    res.status(500).json({ message: '密碼修改失敗' });
  }
});

// 更新使用者個人資料路由
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: '使用者不存在' });
    }

    // 從請求中獲取要更新的欄位
    const { name, birthday, address, idNumber } = req.body;

    // 檢查身分證字號是否已被使用
    if (idNumber && idNumber !== user.idNumber) {
      const existingUser = await User.findOne({ idNumber });
      if (existingUser) {
        return res.status(400).json({ message: '此身分證字號已被使用' });
      }
    }

    // 更新使用者資料
    if (name) user.name = name;
    if (birthday) user.birthday = birthday;
    if (address) user.address = address;
    if (idNumber) user.idNumber = idNumber;

    await user.save();

    // 回傳更新後的使用者資料
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

// 重新發送驗證碼路由
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Resend verification attempt for:', email); // 調試日誌

    // 查找用戶
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: '找不到此用戶' });
    }

    if (user.verified) {
      return res.status(400).json({ message: '此帳號已完成驗證' });
    }

    // 生成新的驗證碼
    const verificationCode = generateVerificationCode();

    // 更新用戶的驗證碼
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = Date.now() + 600000; // 10分鐘後過期
    await user.save();

    // 發送新的驗證碼
    await sendVerificationEmail(email, verificationCode);
    console.log('Verification code resent successfully'); // 調試日誌

    res.json({ message: '驗證碼已重新發送' });
  } catch (error) {
    console.error('Resend verification error:', error); // 錯誤日誌
    res.status(500).json({ message: '重新發送驗證碼失敗' });
  }
});

export default router;
