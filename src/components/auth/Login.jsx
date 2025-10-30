// src/components/auth/Login.jsx

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService.js';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);
    if (result.success) {
      // Redirect based on role
      const dashboardRoute = authService.getDashboardRoute();
      navigate(dashboardRoute);
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const testCredentials = authService.getTestCredentials();

  const fillTestCredentials = (cred) => {
    setEmail(cred.email);
    setPassword(cred.password);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Timetable Management System</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="test-credentials">
          <h4>Test Credentials:</h4>
          {testCredentials.map((cred, index) => (
            <button
              key={index}
              type="button"
              className="test-btn"
              onClick={() => fillTestCredentials(cred)}
            >
              {cred.role}: {cred.email}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
