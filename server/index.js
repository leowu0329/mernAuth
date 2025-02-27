// 引入必要的模組
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';

// 設置 __dirname (在 ES modules 中需要手動設置)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 載入環境變數，指定 .env 檔案位置
dotenv.config({ path: path.join(__dirname, '.env') });

// 建立 Express 應用程式實例
const app = express();

// 檢查環境變數是否正確載入
console.log('MONGODB_URI:', process.env.MONGODB_URI); // 用於調試
console.log('Environment variables loaded:', {
  MONGODB_URI: process.env.MONGODB_URI,
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET ? '已設置' : '未設置',
});

// 確保 JWT 密鑰已設置
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in environment variables');
  process.exit(1);
}

// 設置中間件
app.use(express.json()); // 解析 JSON 請求體
app.use(cookieParser()); // 解析 Cookie
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// 設置路由
app.use('/api/auth', authRoutes);

// 全局錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '伺服器錯誤' });
});

// 連接到 MongoDB 資料庫
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    console.log('Current working directory:', process.cwd()); // 用於調試
    console.log('Environment variables loaded:', {
      MONGODB_URI: process.env.MONGODB_URI,
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
    });

    // 確保 MongoDB URI 已設置
    if (!mongoURI) {
      throw new Error(
        'MongoDB URI is not defined in environment variables. Please check your .env file.',
      );
    }

    // 建立資料庫連接
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// 啟動伺服器
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDB(); // 先連接資料庫
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

// 執行伺服器啟動程序
startServer();
