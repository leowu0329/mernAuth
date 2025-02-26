import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Profile() {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put(
        '/api/auth/profile',
        { name: formData.name }, // 只發送要更新的欄位
        { withCredentials: true },
      );
      setUser(response.data.user);
      toast.success('個人資料更新成功');
    } catch (error) {
      toast.error(error.response?.data?.message || '更新失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">編輯個人資料</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">姓名</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">電子郵件</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 bg-gray-100"
              disabled
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            {loading ? '更新中...' : '更新資料'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
