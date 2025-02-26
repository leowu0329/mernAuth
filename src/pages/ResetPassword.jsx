import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('密碼不一致');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      toast.success('密碼重設成功！');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || '密碼重設失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">重設密碼</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">新密碼</label>
            <PasswordInput
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入新密碼"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">確認新密碼</label>
            <PasswordInput
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="請再次輸入新密碼"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            {loading ? '重設中...' : '重設密碼'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
