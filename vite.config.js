// 引入 Vite 的設定函數
import { defineConfig } from 'vite';
// 引入 React 插件
import react from '@vitejs/plugin-react';
// 引入 Tailwind CSS 插件
import tailwindcss from '@tailwindcss/vite';

// Vite 設定檔案
// 詳細文件: https://vite.dev/config/
export default defineConfig({
  // 配置使用的插件
  plugins: [
    // React 支援
    react(),
    // Tailwind CSS 支援
    tailwindcss(),
  ],
});
