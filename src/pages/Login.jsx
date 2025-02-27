// 引入必要的 React Hooks 和相關模組
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import { FaEnvelope } from 'react-icons/fa';

// 登入頁面組件
function Login() {
  // 表單資料狀態
  const [formData, setFormData] = useState({
    email: 'ryowu0329@gmail.com', // 電子郵件
    password: 'leo140814', // 密碼
  });
  // 載入狀態
  const [loading, setLoading] = useState(false);
  // 用於頁面導航的 hook
  const navigate = useNavigate();
  // 用於獲取當前位置的 hook
  const location = useLocation();
  // 從身份驗證 Context 中獲取登入函數
  const { login } = useAuth();

  // 處理表單輸入變更
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 發送登入請求
      const response = await login(formData.email, formData.password);
      const user = response.user;

      if (!user.verified) {
        // 如果用戶未驗證，導向驗證頁面
        navigate(`/verify-email/${user.email}`);
        toast.warning('請先完成信箱驗證');
      } else {
        // 如果用戶已驗證，導向原目標頁面或首頁
        const from = location.state?.from?.pathname || '/';
        navigate(from);
        toast.success('登入成功！');
      }
    } catch (error) {
      // 顯示錯誤提示
      toast.error(error.response?.data?.message || '登入失敗');
    } finally {
      setLoading(false);
    }
  };

  // 渲染登入表單
  return (
    // 容器元素，設置最大寬度和內邊距
    <div className="container mx-auto px-4 py-8">
      {/* 內容區塊，限制最大寬度並置中 */}
      <div className="max-w-md mx-auto">
        {/* 頁面標題 */}
        <h1 className="text-3xl font-bold text-center mb-8">登入</h1>
        {/* 登入表單 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 電子郵件輸入區塊 */}
          <div>
            {/* 電子郵件輸入欄位標籤 */}
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
          {/* 密碼輸入區塊 */}
          <div>
            {/* 密碼輸入欄位標籤 */}
            <label className="block text-gray-700 mb-2">密碼</label>
            {/* 密碼輸入組件 */}
            <PasswordInput
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {/* 忘記密碼連結 */}
            <div className="mt-1 text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-500 hover:underline"
              >
                忘記密碼？
              </Link>
            </div>
          </div>
          {/* 提交按鈕 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </form>
        {/* 註冊連結區塊 */}
        <div className="mt-4 text-center">
          還沒有帳號？
          <Link to="/register" className="text-blue-500 hover:underline ml-1">
            立即註冊
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
