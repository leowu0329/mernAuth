// 引入必要的模組
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import 'dotenv/config';

// 保護路由的中間件，確保只有已認證的用戶可以訪問
export const protect = async (req, res, next) => {
  try {
    // 從 cookies 中獲取 token
    const token = req.cookies.token;

    // 如果沒有 token，返回未認證錯誤
    if (!token) {
      return res.status(401).json({ message: '請先登入' });
    }

    // 用於調試的日誌
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    console.log('Token:', token);

    try {
      // 驗證 token 並解碼
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // 根據解碼後的用戶 ID 查找用戶，不返回密碼欄位
      const user = await User.findById(decoded.id).select('-password');

      // 如果找不到用戶，返回錯誤
      if (!user) {
        return res.status(401).json({ message: '使用者不存在' });
      }

      // 將用戶信息添加到請求對象中
      req.user = user;
      // 繼續執行下一個中間件或路由處理器
      next();
    } catch (error) {
      // 處理 JWT 驗證錯誤
      console.error('JWT verification error:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: '認證已過期，請重新登入' });
      }
      res.status(500).json({ message: '伺服器錯誤' });
    }
  } catch (error) {
    // 處理其他錯誤
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
};
