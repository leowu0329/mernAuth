// 引入必要的 React 相關模組
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// 引入全局樣式
import './index.css';
// 引入根組件
import App from './App.jsx';

// 使用 createRoot API 渲染應用程式
createRoot(document.getElementById('root')).render(
  // 使用 StrictMode 進行開發時的額外檢查
  <StrictMode>
    <App />
  </StrictMode>,
);
