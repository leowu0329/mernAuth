// 引入必要的 React Hooks 和相關模組
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import PasswordInput from '../components/PasswordInput';

// 修改密碼頁面組件
function ChangePassword() {
  // 表單資料狀態
  const [formData, setFormData] = useState({
    currentPassword: '', // 當前密碼
    newPassword: '', // 新密碼
    confirmPassword: '', // 確認新密碼
  });
  // 載入狀態
  const [loading, setLoading] = useState(false);
  // 用於頁面導航的 hook
  const navigate = useNavigate();

  // 處理表單輸入變更
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 驗證新密碼
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('新密碼與確認密碼不一致');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('新密碼長度至少需要6個字元');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/change-password',
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          withCredentials: true,
        },
      );

      toast.success(response.data.message || '密碼修改成功');
      // 清空表單
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      // 導航到首頁
      navigate('/');
    } catch (error) {
      console.error('修改密碼錯誤:', error);
      toast.error(error.response?.data?.message || '密碼修改失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 渲染修改密碼表單
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">修改密碼</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 當前密碼輸入區塊 */}
          <div>
            <label className="block text-gray-700 mb-2">當前密碼</label>
            <PasswordInput
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="請輸入當前密碼"
            />
          </div>
          {/* 新密碼輸入區塊 */}
          <div>
            <label className="block text-gray-700 mb-2">新密碼</label>
            <PasswordInput
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="請輸入新密碼"
            />
          </div>
          {/* 確認新密碼輸入區塊 */}
          <div>
            <label className="block text-gray-700 mb-2">確認新密碼</label>
            <PasswordInput
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="請再次輸入新密碼"
            />
          </div>
          {/* 提交按鈕 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            {loading ? '修改中...' : '修改密碼'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
