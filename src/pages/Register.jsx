import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import { FaUser, FaEnvelope } from 'react-icons/fa';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await register(
        formData.name,
        formData.email,
        formData.password,
      );
      toast.success(response.message);
      navigate(`/verify-email/${formData.email}`);
    } catch (error) {
      toast.error(error.response?.data?.message || '註冊失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">註冊</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">姓名</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>
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
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            {loading ? '註冊中...' : '註冊'}
          </button>
        </form>
        <div className="mt-4 text-center">
          已經有帳號？
          <Link to="/login" className="text-blue-500 hover:underline ml-1">
            立即登入
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
