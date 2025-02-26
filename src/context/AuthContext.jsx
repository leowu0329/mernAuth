import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/auth/check-auth', {
        withCredentials: true,
      });
      setUser(response.data.user);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('檢查認證狀態時發生錯誤:', error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post(
      '/api/auth/login',
      { email, password },
      { withCredentials: true },
    );

    // 只有在用戶已驗證時才設置用戶狀態
    if (response.data.user.verified) {
      setUser(response.data.user);
    }

    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await axios.post('/api/auth/register', {
      name,
      email,
      password,
    });
    return response.data;
  };

  const logout = async () => {
    await axios.post('/api/auth/logout', {}, { withCredentials: true });
    setUser(null);
  };

  const forgotPassword = async (email) => {
    const response = await axios.post('/api/auth/forgot-password', { email });
    return response.data;
  };

  const resetPassword = async (token, password) => {
    const response = await axios.post(`/api/auth/reset-password/${token}`, {
      password,
    });
    return response.data;
  };

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

export const useAuth = () => useContext(AuthContext);
