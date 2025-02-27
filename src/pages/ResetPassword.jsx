// 引入必要的 React Hooks 和相關模組
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';

// 重設密碼頁面組件
function ResetPassword() {
  // 密碼相關狀態
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // 載入狀態
  const [loading, setLoading] = useState(false);
  // 從身份驗證 Context 中獲取重設密碼函數
  const { resetPassword } = useAuth();
  // 用於頁面導航的 hook
  const navigate = useNavigate();
  // 從 URL 參數中獲取重設密碼 token
  const { token } = useParams();

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    // 檢查兩次輸入的密碼是否一致
    if (password !== confirmPassword) {
      toast.error('密碼不一致');
      return;
    }

    setLoading(true);
    try {
      // 發送重設密碼請求
      await resetPassword(token, password);
      // 顯示成功提示並導航到登入頁面
      toast.success('密碼重設成功！');
      navigate('/login');
    } catch (error) {
      // 顯示錯誤提示
      toast.error(error.response?.data?.message || '密碼重設失敗');
    } finally {
      setLoading(false);
    }
  };

  // 渲染重設密碼表單
  return (
    // 容器元素，設置最大寬度和內邊距
    <div className="container mx-auto px-4 py-8">
      {/* 內容區塊，限制最大寬度並置中 */}
      <div className="max-w-md mx-auto">
        {/* 頁面標題 */}
        <h1 className="text-3xl font-bold text-center mb-8">重設密碼</h1>
        {/* 重設密碼表單 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 新密碼輸入區塊 */}
          <div>
            <label className="block text-gray-700 mb-2">新密碼</label>
            <PasswordInput
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入新密碼"
            />
          </div>
          {/* 確認新密碼輸入區塊 */}
          <div>
            <label className="block text-gray-700 mb-2">確認新密碼</label>
            <PasswordInput
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="請再次輸入新密碼"
            />
          </div>
          {/* 提交按鈕 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            {loading ? '重設中...' : '重設密碼'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
