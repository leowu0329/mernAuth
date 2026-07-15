import React, { useState } from 'react';
import PasswordInput from '../components/PasswordInput';
import GlobalModal from '../components/GlobalModal';
import { request } from '../utils/api';

const ChangePassword = () => {
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [modal, setModal] = useState({ show: false, title: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setModal({ show: true, title: '輸入錯誤', message: '新密碼與確認密碼不一致！' });
      return;
    }

    try {
      const data = await request('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      setModal({ show: true, title: '成功', message: data.msg });
      setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setModal({ show: true, title: '變更失敗', message: err.message });
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center w-100 min-vh-100">
      <div className="card p-4 shadow" style={{ width: '450px' }}>
        <h3 className="text-center mb-4">更改密碼</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">目前密碼</label>
            <PasswordInput value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="form-label">新密碼</label>
            <PasswordInput value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="form-label">確認新密碼</label>
            <PasswordInput value={passwords.confirmNewPassword} onChange={(e) => setPasswords({ ...passwords, confirmNewPassword: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary w-100">更新密碼</button>
        </form>
      </div>
      <GlobalModal show={modal.show} title={modal.title} message={modal.message} onClose={() => setModal({ ...modal, show: false })} />
    </div>
  );
};

export default ChangePassword;