// 引入必要的 React Router 組件和相關模組
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// 引入 Toast 通知組件和樣式
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// 引入身份驗證 Context Provider
import { AuthProvider } from './context/AuthContext';
// 引入共用組件
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
// 引入頁面組件
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';
import VerifyEmail from './pages/VerifyEmail';
import Profile from './pages/Profile';

// App 根組件
function App() {
  return (
    // 提供身份驗證 Context
    <AuthProvider>
      {/* 路由配置 */}
      <Router>
        {/* 頁面容器 */}
        <div className="min-h-screen bg-gray-50">
          {/* 導航欄 */}
          <Navbar />
          {/* 主要內容區域 */}
          <div className="container mx-auto px-4 py-8">
            <Routes>
              {/* 首頁路由 - 需要登入 */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              {/* 登入頁面路由 */}
              <Route path="/login" element={<Login />} />
              {/* 註冊頁面路由 */}
              <Route path="/register" element={<Register />} />
              {/* 忘記密碼頁面路由 */}
              <Route path="/forgot-password" element={<ForgotPassword />} />
              {/* 重設密碼頁面路由 */}
              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />
              {/* 驗證信箱頁面路由 */}
              <Route path="/verify-email/:email" element={<VerifyEmail />} />
              {/* 修改密碼頁面路由 - 需要登入 */}
              <Route
                path="/change-password"
                element={
                  <ProtectedRoute>
                    <ChangePassword />
                  </ProtectedRoute>
                }
              />
              {/* 個人資料頁面路由 - 需要登入 */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
          {/* Toast 通知容器 */}
          <ToastContainer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
