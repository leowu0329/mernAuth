// 引入必要的 React Hooks 和相關模組
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// 個人資料頁面組件
function Profile() {
  // 從身份驗證 Context 中獲取用戶資訊和更新函數
  const { user, setUser } = useAuth();
  // 用於頁面導航的 hook
  const navigate = useNavigate();
  // 表單資料狀態
  const [formData, setFormData] = useState({
    name: user.name || '', // 姓名
    email: user.email || '', // 電子郵件
    birthday: user.birthday
      ? new Date(user.birthday).toISOString().split('T')[0] // 將日期格式化為 YYYY-MM-DD
      : '',
    address: user.address || '', // 住址
    idNumber: user.idNumber || '', // 身分證字號
  });
  // 載入狀態
  const [loading, setLoading] = useState(false);

  // 處理表單輸入變更
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 發送更新個人資料請求
      const response = await axios.put(
        'http://localhost:5000/api/auth/profile',
        {
          name: formData.name,
          birthday: formData.birthday,
          address: formData.address,
          idNumber: formData.idNumber,
        },
        { withCredentials: true },
      );
      // 更新全域用戶資訊
      setUser(response.data.user);
      // 顯示成功提示並導航到首頁
      toast.success('個人資料更新成功');
      navigate('/');
    } catch (error) {
      // 顯示錯誤提示
      toast.error(error.response?.data?.message || '更新失敗');
    } finally {
      setLoading(false);
    }
  };

  // 渲染個人資料表單
  return (
    // 容器元素，設置最大寬度和內邊距
    <div className="container mx-auto px-4 py-8">
      {/* 內容區塊，限制最大寬度並置中 */}
      <div className="max-w-md mx-auto">
        {/* 頁面標題 */}
        <h1 className="text-3xl font-bold text-center mb-8">個人資料</h1>
        {/* 個人資料表單 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 姓名輸入欄位 */}
          <div>
            <label className="block text-gray-700 mb-2">姓名</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          {/* 電子郵件輸入欄位（禁用） */}
          <div>
            <label className="block text-gray-700 mb-2">電子郵件</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 bg-gray-100"
              disabled
            />
          </div>
          {/* 生日輸入欄位 */}
          <div>
            <label className="block text-gray-700 mb-2">生日</label>
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          {/* 住址輸入欄位 */}
          <div>
            <label className="block text-gray-700 mb-2">住址</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          {/* 身分證字號輸入欄位 */}
          <div>
            <label className="block text-gray-700 mb-2">身分證字號</label>
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              pattern="^[A-Z][12]\d{8}$"
              title="請輸入有效的身分證字號"
            />
          </div>
          {/* 提交按鈕 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            {loading ? '更新中...' : '更新資料'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
