// 引入必要的 React Router 和自定義 Context Hook
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ProtectedRoute 組件用於保護需要登入才能訪問的路由
// children: 需要保護的子組件內容
function ProtectedRoute({ children }) {
  // 從 AuthContext 獲取用戶狀態和加載狀態
  const { user, loading } = useAuth();
  // 獲取當前路由位置，用於登入後重定向
  const location = useLocation();

  // 當認證狀態正在檢查時顯示載入動畫
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        {/* 使用 Tailwind CSS 實現的載入動畫 */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 如果用戶未登入，重定向到登入頁面
  if (!user) {
    // 保存用戶嘗試訪問的頁面，登入後可以重定向回來
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 如果用戶已登入，渲染受保護的內容
  return children;
}

export default ProtectedRoute;
