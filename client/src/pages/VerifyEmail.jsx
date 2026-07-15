import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalModal from '../components/GlobalModal';
import { request } from '../utils/api';

const VerifyEmail = () => {
  const [email, setEmail] = useState('');
  const [modal, setModal] = useState({ show: false, title: '', message: '' });
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    // 信箱格式基本檢查
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setModal({ show: true, title: '輸入錯誤', message: '信箱格式不正確，請重新確認！' });
      return;
    }

    try {
      const data = await request('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setModal({ show: true, title: '驗證成功', message: data.msg });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setModal({ show: true, title: '驗證失敗', message: err.message });
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow-lg" style={{ width: '400px' }}>
        <h3 className="text-center mb-3">驗證信箱</h3>
        <p className="text-muted text-center">請輸入您註冊的信箱以完成開通手續</p>
        <form onSubmit={handleVerify}>
          <div className="mb-3">
            <input type="email" className="form-control" placeholder="example@domain.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-warning w-100 text-white">啟動帳號</button>
        </form>
      </div>
      <GlobalModal show={modal.show} title={modal.title} message={modal.message} onClose={() => setModal({ ...modal, show: false })} />
    </div>
  );
};

export default VerifyEmail;