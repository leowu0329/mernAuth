// 引入必要的 React Hooks 和相關模組
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import { FaUser, FaEnvelope } from 'react-icons/fa';

// 註冊頁面組件
function Register() {
  // 表單資料狀態
  const [formData, setFormData] = useState({
    name: 'ryowu', // 姓名
    email: 'ryowu0329@gmail.com', // 電子郵件
    password: 'leo140814', // 密碼
  });
  // 載入狀態
  const [loading, setLoading] = useState(false);
  // 從身份驗證 Context 中獲取註冊函數
  const { register } = useAuth();
  // 用於頁面導航的 hook
  const navigate = useNavigate();

  // 處理表單輸入變更
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 發送註冊請求
      const response = await register(
        formData.name,
        formData.email,
        formData.password,
      );
      // 顯示成功提示並導航到驗證頁面
      toast.success(response.message);
      navigate(`/verify-email/${formData.email}`);
    } catch (error) {
      // 顯示錯誤提示
      toast.error(error.response?.data?.message || '註冊失敗');
    } finally {
      setLoading(false);
    }
  };

  // 渲染註冊表單
  return (
    // 容器元素，設置最大寬度和內邊距
    <div className="container mx-auto px-4 py-8">
      {/* 內容區塊，限制最大寬度並置中 */}
      <div className="max-w-md mx-auto">
        {/* 頁面標題 */}
        <h1 className="text-3xl font-bold text-center mb-8">註冊</h1>
        {/* 註冊表單 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 姓名輸入欄位 */}
          <div>
            <label className="block text-gray-700 mb-2">姓名</label>
            <div className="relative">
              {/* 使用者圖示 */}
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {/* 姓名輸入框 */}
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>
          {/* 電子郵件輸入欄位 */}
          <div>
            <label className="block text-gray-700 mb-2">電子郵件</label>
            <div className="relative">
              {/* 電子郵件圖示 */}
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {/* 電子郵件輸入框 */}
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>
          {/* 密碼輸入欄位 */}
          <div>
            <label className="block text-gray-700 mb-2">密碼</label>
            <PasswordInput
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          {/* 提交按鈕 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            {loading ? '註冊中...' : '註冊'}
          </button>
        </form>
        {/* 登入連結 */}
        <div className="mt-4 text-center">
          已經有帳號？
          <Link to="/login" className="text-blue-500 hover:underline ml-1">
            立即登入
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
