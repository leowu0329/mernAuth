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
      // Only check auth status if we have a token in cookies
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
      // 401 Unauthorized is expected when not logged in
      if (error.response?.status === 401) {
        setUser(null);
      } else {
        console.error('檢查認證狀態時發生錯誤:', error);
      }
    } finally {
      setLoading(false);
    }
  };

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

  const logout = async () => {
    await axios.post(
      'http://localhost:5000/api/auth/logout',
      {},
      { withCredentials: true },
    );
    setUser(null);
  };

  const forgotPassword = async (email) => {
    const response = await axios.post(
      'http://localhost:5000/api/auth/forgot-password',
      { email },
    );
    return response.data;
  };

  const resetPassword = async (token, password) => {
    const response = await axios.post(
      `http://localhost:5000/api/auth/reset-password/${token}`,
      {
        password,
      },
    );
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
