// src/components/common/Layout.jsx

import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'faculty') return '/faculty/dashboard';
    if (user?.role === 'student') return '/student/dashboard';
    return '/';
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1>Timetable System</h1>
          
          {user && (
            <div className="user-info">
              <span>Welcome, {user.name}</span>
              <span className="role-badge">{user.role}</span>
              <nav className="nav-links">
                <a href={getDashboardLink()}>Dashboard</a>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
