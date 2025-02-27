// 引入必要的 React 相關模組
import { Link, useNavigate } from 'react-router-dom';
// 引入身份驗證相關 Context
import { useAuth } from '../context/AuthContext';
// 引入 Font Awesome 圖示
import { FaUser, FaSignOutAlt, FaCog, FaKey } from 'react-icons/fa';
// 引入提示訊息組件
import { toast } from 'react-toastify';

// 導航欄組件
function Navbar() {
  // 從 AuthContext 中獲取使用者資訊和登出函數
  const { user, logout } = useAuth();
  // 用於頁面導航的 hook
  const navigate = useNavigate();

  // 如果使用者未登入，不顯示導航欄
  if (!user) return null;

  // 處理登出事件
  const handleLogout = async () => {
    // 顯示確認對話框
    if (window.confirm('確定要登出嗎？')) {
      try {
        // 執行登出操作
        await logout();
        // 顯示成功提示
        toast.success('登出成功');
        // 導航到登入頁面
        navigate('/login');
      } catch (error) {
        // 顯示錯誤提示
        toast.error('登出失敗');
      }
    }
  };

  // 渲染導航欄
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* 網站標題/Logo */}
          <Link to="/" className="text-xl font-bold">
            MERN Auth
          </Link>
          {/* 導航選項 */}
          <div className="flex items-center space-x-4">
            {/* 個人資料連結 */}
            <Link
              to="/profile"
              className="flex items-center text-gray-700 hover:text-blue-600"
            >
              <FaUser className="mr-2" />
              {user.name}
            </Link>
            {/* 修改密碼連結 */}
            <Link
              to="/change-password"
              className="flex items-center text-gray-700 hover:text-blue-600"
            >
              <FaKey className="mr-2" />
              修改密碼
            </Link>
            {/* 登出按鈕 */}
            <button
              onClick={handleLogout}
              className="flex items-center text-red-600 hover:text-red-800"
            >
              <FaSignOutAlt className="mr-2" />
              登出
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
