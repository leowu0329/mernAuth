// 引入必要的 React Hooks 和 axios
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// 創建身份驗證 Context
const AuthContext = createContext();

// 身份驗證 Provider 組件
export const AuthProvider = ({ children }) => {
  // 用戶狀態
  const [user, setUser] = useState(null);
  // 載入狀態
  const [loading, setLoading] = useState(true);

  // 組件掛載時檢查身份驗證狀態
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // 檢查身份驗證狀態
  const checkAuthStatus = async () => {
    try {
      // 只在有 token 的情況下檢查身份驗證狀態
      const response = await axios.get(
        'http://localhost:5000/api/auth/check-auth',
        {
          withCredentials: true,
        },
      );
      if (response.data?.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      // 401 未授權是預期的未登入狀態
      if (error.response?.status === 401) {
        setUser(null);
      } else {
        console.error('檢查認證狀態時發生錯誤:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // 登入函數
  const login = async (email, password) => {
    const response = await axios.post(
      'http://localhost:5000/api/auth/login',
      { email, password },
      { withCredentials: true },
    );

    // 只有在用戶已驗證時才設置用戶狀態
    if (response.data.user.verified) {
      setUser(response.data.user);
    }

    return response.data;
  };

  // 註冊函數
  const register = async (name, email, password) => {
    const response = await axios.post(
      'http://localhost:5000/api/auth/register',
      {
        name,
        email,
        password,
      },
    );
    return response.data;
  };

  // 登出函數
  const logout = async () => {
    await axios.post(
      'http://localhost:5000/api/auth/logout',
      {},
      { withCredentials: true },
    );
    setUser(null);
  };

  // 忘記密碼函數
  const forgotPassword = async (email) => {
    const response = await axios.post(
      'http://localhost:5000/api/auth/forgot-password',
      { email },
    );
    return response.data;
  };

  // 重設密碼函數
  const resetPassword = async (token, password) => {
    const response = await axios.post(
      `http://localhost:5000/api/auth/reset-password/${token}`,
      {
        password,
      },
    );
    return response.data;
  };

  // 提供 Context 值給子組件
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 自定義 Hook 用於獲取 Auth Context
export const useAuth = () => useContext(AuthContext);
