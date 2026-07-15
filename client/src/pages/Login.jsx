import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';
import GlobalModal from '../components/GlobalModal';
import { request } from '../utils/api';

const Login = ({ setAuthToken }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [modal, setModal] = useState({ show: false, title: '', message: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuthToken(data.token);
      navigate('/home');
    } catch (err) {
      setModal({ show: true, title: '登入失敗', message: err.message });
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow-lg" style={{ width: '400px' }}>
        <h3 className="text-center mb-4">系統登入</h3>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">電子信箱</label>
            <input type="email" className="form-control" required onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="form-label">密碼</label>
            <PasswordInput value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </div>
          <div className="d-flex justify-content-between mb-3">
            <Link to="/forgot-password">忘記密碼？</Link>
            <Link to="/register">註冊新帳號</Link>
          </div>
          <button type="submit" className="btn btn-success w-100">登入</button>
        </form>
      </div>
      <GlobalModal show={modal.show} title={modal.title} message={modal.message} onClose={() => setModal({ ...modal, show: false })} />
    </div>
  );
};

export default Login;