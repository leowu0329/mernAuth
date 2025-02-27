// 引入身份驗證 Context Hook
import { useAuth } from '../context/AuthContext';

// 首頁組件
function Home() {
  // 從身份驗證 Context 中獲取用戶資訊
  const { user } = useAuth();

  return (
    // 容器元素，限制最大寬度並置中
    <div className="max-w-4xl mx-auto">
      {/* 歡迎標題 */}
      <h1 className="text-3xl font-bold mb-8">歡迎回來，{user.name}！</h1>
      {/* 個人資料卡片 */}
      <div className="bg-white shadow-md rounded-lg p-6">
        {/* 卡片標題 */}
        <h2 className="text-xl font-semibold mb-4">個人資料</h2>
        {/* 資料項目列表 */}
        <div className="space-y-4">
          {/* 姓名資訊 */}
          <div>
            <span className="text-gray-600">姓名：</span>
            <span>{user.name}</span>
          </div>
          {/* 電子郵件資訊 */}
          <div>
            <span className="text-gray-600">電子郵件：</span>
            <span>{user.email}</span>
          </div>
          {/* 帳號驗證狀態 */}
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
