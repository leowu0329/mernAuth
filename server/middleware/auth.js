import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import 'dotenv/config';

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: '請先登入' });
    }

    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    console.log('Token:', token);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ message: '使用者不存在' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('JWT verification error:', error);
      return res.status(401).json({ message: '認證已過期，請重新登入' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
};
