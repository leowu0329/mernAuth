import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GlobalModal from '../components/GlobalModal';
import { request } from '../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [modal, setModal] = useState({ show: false, title: '', message: '' });
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setModal({ show: true, title: '格式不正確', message: '請輸入正確的電子信箱。' });
      return;
    }

    try {
      const data = await request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setModal({ show: true, title: '密碼已重置', message: data.msg });
      setTimeout(() => navigate('/login'), 3500);
    } catch (err) {
      setModal({ show: true, title: '失敗', message: err.message });
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow-lg" style={{ width: '400px' }}>
        <h3 className="text-center mb-3">忘記密碼</h3>
        <form onSubmit={handleReset}>
          <div className="mb-3">
            <label className="form-label">您的電子信箱</label>
            <input type="email" className="form-control" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-danger w-100">重設密碼</button>
        </form>
        <div className="text-center mt-3">
          <Link to="/login">返回登入畫面</Link>
        </div>
      </div>
      <GlobalModal show={modal.show} title={modal.title} message={modal.message} onClose={() => setModal({ ...modal, show: false })} />
    </div>
  );
};

export default ForgotPassword;