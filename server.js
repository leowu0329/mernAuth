require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// 連線至 MongoDB Cloud
connectDB();

app.use(cors());
app.use(express.json());

// API 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ipqc', require('./routes/ipqc'));
app.use('/api/defect', require('./routes/defect'));
app.use('/api/order', require('./routes/order'));
app.use('/api/operator', require('./routes/operator'));
app.use('/api/spec', require('./routes/spec'));

// 靜態檔案部署 (適用於 Vercel / 生產環境)
const path = require('path');
if (process.env.NODE_ENV === 'production' || true) {
  app.use(express.static('client/dist'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`伺服器運行於埠號 ${PORT}`));