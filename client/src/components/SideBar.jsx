import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const SideBar = ({ onLogoutClick }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className="bg-dark text-white d-flex flex-column"
      style={{
        width: collapsed ? '70px' : '260px',
        transition: 'all 0.3s',
        minHeight: '100vh',
      }}
    >
      <div className="p-3 d-flex justify-content-between align-items-center border-bottom border-secondary">
        {!collapsed && <span className="fw-bold fs-5 text-truncate">工廠管理系統</span>}
        <button
          className="btn btn-outline-light btn-sm mx-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          <i className={`bi ${collapsed ? 'bi-text-indent-left' : 'bi-text-indent-right'}`}></i>
        </button>
      </div>

      <div className="nav nav-pills flex-column mb-auto p-2">
        <NavLink to="/home" className={({ isActive }) => `nav-link text-white my-1 d-flex align-items-center ${isActive ? 'active bg-primary' : ''}`}>
          <i className="bi bi-house-door-fill fs-5 me-3"></i>
          {!collapsed && <span>首頁</span>}
        </NavLink>

        <NavLink to="/ipqc" className={({ isActive }) => `nav-link text-white my-1 d-flex align-items-center ${isActive ? 'active bg-primary' : ''}`}>
          <i className="bi bi-shield-fill-check fs-5 me-3"></i>
          {!collapsed && <span>IPQC 巡檢</span>}
        </NavLink>

        <NavLink to="/edit-profile" className={({ isActive }) => `nav-link text-white my-1 d-flex align-items-center ${isActive ? 'active bg-primary' : ''}`}>
          <i className="bi bi-person-lines-fill fs-5 me-3"></i>
          {!collapsed && <span>修改個人訊息</span>}
        </NavLink>

        <NavLink to="/change-password" className={({ isActive }) => `nav-link text-white my-1 d-flex align-items-center ${isActive ? 'active bg-primary' : ''}`}>
          <i className="bi bi-key-fill fs-5 me-3"></i>
          {!collapsed && <span>更改密碼</span>}
        </NavLink>
      </div>

      <div className="p-2 border-top border-secondary">
        <button
          onClick={onLogoutClick}
          className="btn btn-danger w-100 d-flex align-items-center justify-content-center"
        >
          <i className="bi bi-box-arrow-right fs-5 me-2"></i>
          {!collapsed && <span>登出</span>}
        </button>
      </div>
    </div>
  );
};

export default SideBar;