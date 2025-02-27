// 引入必要的 React Hooks 和相關模組
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope } from 'react-icons/fa';

// 忘記密碼頁面組件
function ForgotPassword() {
  // 電子郵件狀態
  const [email, setEmail] = useState('');
  // 載入狀態
  const [loading, setLoading] = useState(false);
  // 從身份驗證 Context 中獲取忘記密碼函數
  const { forgotPassword } = useAuth();

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 發送忘記密碼請求
      await forgotPassword(email);
      // 顯示成功提示
      toast.success('重設密碼連結已發送至您的信箱');
    } catch (error) {
      // 顯示錯誤提示
      toast.error(error.response?.data?.message || '發送重設密碼信件失敗');
    } finally {
      setLoading(false);
    }
  };

  // 渲染忘記密碼表單
  return (
    <div className="max-w-md mx-auto">
      {/* 頁面標題 */}
      <h1 className="text-3xl font-bold text-center mb-8">忘記密碼</h1>
      {/* 忘記密碼表單 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          {/* 電子郵件輸入欄位標籤 */}
          <label className="block text-gray-700 mb-2">電子郵件</label>
          <div className="relative">
            {/* 電子郵件圖示 */}
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {/* 電子郵件輸入框 */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>
        {/* 提交按鈕 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          {loading ? '發送中...' : '發送重設密碼信件'}
        </button>
      </form>
      {/* 返回登入連結 */}
      <div className="mt-4 text-center">
        <Link to="/login" className="text-blue-500 hover:underline">
          返回登入
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
