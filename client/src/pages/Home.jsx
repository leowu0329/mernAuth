import React, { useEffect, useState } from 'react';

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <div className="d-flex flex-column justify-content-center align-items-center w-100 min-vh-100">
      <div className="card p-5 shadow text-center" style={{ maxWidth: '500px' }}>
        <i className="bi bi-person-badge text-primary" style={{ fontSize: '4rem' }}></i>
        <h2 className="mt-3">歡迎回來！{user?.nickname || user?.username}</h2>
        <p className="text-muted mt-2">工廠製造與品質巡檢平台首頁</p>
        <hr />
        <p className="text-start">請由側邊欄進行操作：</p>
        <ul className="text-start">
          <li><strong>IPQC 巡檢</strong>: 品質追蹤與報表匯入</li>
          <li><strong>修改個人訊息</strong>: 完善組織任職與聯絡資訊</li>
          <li><strong>更改密碼</strong>: 確保系統訪問安全</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;