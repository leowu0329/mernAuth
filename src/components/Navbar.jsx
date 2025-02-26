import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaSignOutAlt, FaCog, FaKey } from 'react-icons/fa';
import { toast } from 'react-toastify';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    if (window.confirm('確定要登出嗎？')) {
      try {
        await logout();
        toast.success('登出成功');
        navigate('/login');
      } catch (error) {
        toast.error('登出失敗');
      }
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">
            MERN Auth
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              className="flex items-center text-gray-700 hover:text-blue-600"
            >
              <FaUser className="mr-2" />
              {user.name}
            </Link>
            <Link
              to="/change-password"
              className="flex items-center text-gray-700 hover:text-blue-600"
            >
              <FaKey className="mr-2" />
              修改密碼
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center text-red-600 hover:text-red-800"
            >
              <FaSignOutAlt className="mr-2" />
              登出
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
