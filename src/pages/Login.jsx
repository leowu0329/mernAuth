import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import { FaEnvelope } from 'react-icons/fa';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await login(formData.email, formData.password);
      const user = response.user;

      if (!user.verified) {
        // 如果用戶未驗證，導向驗證頁面
        navigate(`/verify-email/${user.email}`);
        toast.warning('請先完成信箱驗證');
      } else {
        // 如果用戶已驗證，導向原目標頁面或首頁
        const from = location.state?.from?.pathname || '/';
        navigate(from);
        toast.success('登入成功！');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || '登入失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">登入</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">電子郵件</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">密碼</label>
            <PasswordInput
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <div className="mt-1 text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-500 hover:underline"
              >
                忘記密碼？
              </Link>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </form>
        <div className="mt-4 text-center">
          還沒有帳號？
          <Link to="/register" className="text-blue-500 hover:underline ml-1">
            立即註冊
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
