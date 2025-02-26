import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import PasswordInput from '../components/PasswordInput';

function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('新密碼不一致');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        '/api/auth/change-password',
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        { withCredentials: true },
      );
      toast.success('密碼修改成功');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || '密碼修改失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">修改密碼</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">當前密碼</label>
            <PasswordInput
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="請輸入當前密碼"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">新密碼</label>
            <PasswordInput
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="請輸入新密碼"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">確認新密碼</label>
            <PasswordInput
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="請再次輸入新密碼"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            {loading ? '修改中...' : '修改密碼'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
