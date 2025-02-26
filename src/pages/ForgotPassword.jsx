import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope } from 'react-icons/fa';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success('重設密碼連結已發送至您的信箱');
    } catch (error) {
      toast.error(error.response?.data?.message || '發送重設密碼信件失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">忘記密碼</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2">電子郵件</label>
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          {loading ? '發送中...' : '發送重設密碼信件'}
        </button>
      </form>
      <div className="mt-4 text-center">
        <Link to="/login" className="text-blue-500 hover:underline">
          返回登入
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
