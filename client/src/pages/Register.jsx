import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';
import GlobalModal from '../components/GlobalModal';
import { request } from '../utils/api';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [modal, setModal] = useState({ show: false, title: '', message: '' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setModal({ show: true, title: '錯誤', message: '兩次輸入的密碼不一致！' });
      return;
    }

    try {
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });
      setModal({ show: true, title: '成功', message: data.msg });
      setTimeout(() => navigate('/verify-email'), 2000);
    } catch (err) {
      setModal({ show: true, title: '註冊失敗', message: err.message });
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow-lg" style={{ width: '400px' }}>
        <h3 className="text-center mb-4">註冊帳號</h3>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">使用者帳號</label>
            <input type="text" className="form-control" required onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="form-label">電子信箱</label>
            <input type="email" className="form-control" required onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="form-label">輸入密碼</label>
            <PasswordInput value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="form-label">再次確認密碼</label>
            <PasswordInput value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary w-100">建立帳號</button>
        </form>
        <div className="text-center mt-3">
          <Link to="/login">已有帳號？前往登入</Link>
        </div>
      </div>
      <GlobalModal show={modal.show} title={modal.title} message={modal.message} onClose={() => setModal({ ...modal, show: false })} />
    </div>
  );
};

export default Register;