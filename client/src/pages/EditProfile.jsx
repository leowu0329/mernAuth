import React, { useState, useEffect } from 'react';
import GlobalModal from '../components/GlobalModal';
import { request } from '../utils/api';

const EditProfile = () => {
  const [profile, setProfile] = useState({
    email: '', username: '', nickname: '', birthday: '', id_card: '',
    mobile: '', factory: '', department: '', job_title: '', role_type: '', address: ''
  });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ show: false, title: '', message: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await request('/auth/profile');
        if (data) {
          setProfile({
            ...data,
            birthday: data.birthday ? data.birthday.split('T')[0] : ''
          });
        }
      } catch (err) {
        setModal({ show: true, title: '錯誤', message: '讀取個人資料時出錯！' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profile)
      });
      setProfile({
        ...updated,
        birthday: updated.birthday ? updated.birthday.split('T')[0] : ''
      });
      // 更新 localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...user, nickname: updated.nickname, username: updated.username }));
      setModal({ show: true, title: '成功', message: '個人訊息更新成功！' });
    } catch (err) {
      setModal({ show: true, title: '錯誤', message: err.message });
    }
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center w-100 min-vh-100"><h3>資料讀取中...</h3></div>;
  }

  return (
    <div className="d-flex justify-content-center align-items-center w-100 min-vh-100 py-5">
      <div className="card p-4 shadow" style={{ width: '700px' }}>
        <h3 className="text-center mb-4">修改個人資料</h3>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">電子信箱 (不可變更)</label>
              <input type="email" className="form-control" value={profile.email} disabled />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">使用者名稱</label>
              <input type="text" className="form-control" value={profile.username} required onChange={e => setProfile({ ...profile, username: e.target.value })} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">暱稱</label>
              <input type="text" className="form-control" value={profile.nickname} onChange={e => setProfile({ ...profile, nickname: e.target.value })} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">生日</label>
              <input type="date" className="form-control" value={profile.birthday} onChange={e => setProfile({ ...profile, birthday: e.target.value })} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">身分證ID</label>
              <input type="text" className="form-control" value={profile.id_card} onChange={e => setProfile({ ...profile, id_card: e.target.value })} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">手機號碼</label>
              <input type="text" className="form-control" value={profile.mobile} onChange={e => setProfile({ ...profile, mobile: e.target.value })} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">廠別</label>
              <input type="text" className="form-control" value={profile.factory} onChange={e => setProfile({ ...profile, factory: e.target.value })} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">部門</label>
              <input type="text" className="form-control" value={profile.department} onChange={e => setProfile({ ...profile, department: e.target.value })} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">職稱</label>
              <input type="text" className="form-control" value={profile.job_title} onChange={e => setProfile({ ...profile, job_title: e.target.value })} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">身分別 (權限)</label>
              <input type="text" className="form-control" value={profile.role_type} onChange={e => setProfile({ ...profile, role_type: e.target.value })} />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">住址</label>
            <input type="text" className="form-control" value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-success w-100">儲存資料</button>
        </form>
      </div>
      <GlobalModal show={modal.show} title={modal.title} message={modal.message} onClose={() => setModal({ ...modal, show: false })} />
    </div>
  );
};

export default EditProfile;