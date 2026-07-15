import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SideBar from './components/SideBar';
import ConfirmModal from './components/ConfirmModal';

// 頁面元件匯入
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import ChangePassword from './pages/ChangePassword';
import EditProfile from './pages/EditProfile';
import IpqcPage from './pages/IPQC/IpqcPage';

function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem('token'));
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setAuthToken(localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
    setShowLogoutConfirm(false);
  };

  // 1. 保護路由保護機制 (限登入存取)
  const ProtectedRoute = ({ children }) => {
    if (!authToken) {
      return <Navigate to="/login" replace />;
    }
    return (
      <div className="d-flex" style={{ minHeight: '100vh' }}>
        <SideBar onLogoutClick={() => setShowLogoutConfirm(true)} />
        <div className="flex-grow-1 bg-light d-flex flex-column" style={{ overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    );
  };

  // 2. 登入限制機制 (已登入不允許再次訪問註冊/登入頁)
  const PublicRoute = ({ children }) => {
    if (authToken) {
      return <Navigate to="/home" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* 公共與未驗證登入路由 */}
        <Route path="/login" element={<PublicRoute><Login setAuthToken={setAuthToken} /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

        {/* 系統核心保護路由 */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/ipqc" element={<ProtectedRoute><IpqcPage /></ProtectedRoute>} />

        {/* 預設路由引導 */}
        <Route path="*" element={<Navigate to={authToken ? "/home" : "/login"} replace />} />
      </Routes>

      {/* 登出確認對話框 */}
      <ConfirmModal
        show={showLogoutConfirm}
        title="系統登出確認"
        message="您確定要結束目前工作階段並安全登出嗎？"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </Router>
  );
}

export default App;