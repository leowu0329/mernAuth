import { useAuth } from '../context/AuthContext';

function Home() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">歡迎回來，{user.name}！</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">個人資料</h2>
        <div className="space-y-4">
          <div>
            <span className="text-gray-600">姓名：</span>
            <span>{user.name}</span>
          </div>
          <div>
            <span className="text-gray-600">電子郵件：</span>
            <span>{user.email}</span>
          </div>
          <div>
            <span className="text-gray-600">帳號狀態：</span>
            <span
              className={user.verified ? 'text-green-600' : 'text-yellow-600'}
            >
              {user.verified ? '已驗證' : '未驗證'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
