// src/components/admin/AdminDashboard.jsx

import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useTimetable } from '../../context/TimetableContext.jsx';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { faculties, subjects, classrooms, divisions, timeSlots, loading } = useData();
  const { timetables } = useTimetable();

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  const stats = {
    faculties: faculties.length,
    subjects: subjects.length,
    classrooms: classrooms.length,
    divisions: divisions.length,
    timeSlots: timeSlots.length,
    timetables: timetables.length
  };

  const managementLinks = [
    { path: '/admin/faculties', title: 'Manage Faculties', icon: '👨‍🏫' },
    { path: '/admin/subjects', title: 'Manage Subjects', icon: '📚' },
    { path: '/admin/classrooms', title: 'Manage Classrooms', icon: '🏫' },
    { path: '/admin/divisions', title: 'Manage Divisions', icon: '👥' },
    { path: '/admin/timeslots', title: 'Manage Time Slots', icon: '⏰' },
    { path: '/admin/generate-timetable', title: 'Generate Timetable', icon: '📅' }
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <p>Welcome back, {user.name}!</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.faculties}</h3>
          <p>Faculties</p>
        </div>
        <div className="stat-card">
          <h3>{stats.subjects}</h3>
          <p>Subjects</p>
        </div>
        <div className="stat-card">
          <h3>{stats.classrooms}</h3>
          <p>Classrooms</p>
        </div>
        <div className="stat-card">
          <h3>{stats.divisions}</h3>
          <p>Divisions</p>
        </div>
        <div className="stat-card">
          <h3>{stats.timeSlots}</h3>
          <p>Time Slots</p>
        </div>
        <div className="stat-card">
          <h3>{stats.timetables}</h3>
          <p>Generated Timetables</p>
        </div>
      </div>

      {/* Management Links */}
      <div className="management-section">
        <h3>Management Options</h3>
        <div className="management-grid">
          {managementLinks.map((link, index) => (
            <Link key={index} to={link.path} className="management-card">
              <div className="card-icon">{link.icon}</div>
              <h4>{link.title}</h4>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>Recent Timetables</h3>
        {timetables.length > 0 ? (
          <div className="timetable-list">
            {timetables.slice(-3).map((tt) => {
              const division = divisions.find(d => d.id === tt.divisionId);
              return (
                <div key={tt.id} className="timetable-item">
                  <span>{division?.name || 'Unknown Division'}</span>
                  <span>{new Date(tt.generatedAt).toLocaleDateString()}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No timetables generated yet.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
