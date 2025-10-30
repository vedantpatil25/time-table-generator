// src/components/faculty/FacultyDashboard.jsx

import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useTimetable } from '../../context/TimetableContext.jsx';
import { Link } from 'react-router-dom';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const { subjects, divisions, faculties } = useData();
  const { timetables } = useTimetable();

  // Get current faculty data
  const currentFaculty = faculties.find(f => f.id === user.id);
  const monitoringDivision = divisions.find(d => d.id === user.monitoringDivision);
  const facultySubjects = subjects.filter(s => currentFaculty?.subjects?.includes(s.id));
  const facultyTimetables = timetables.filter(tt => tt.generatedBy === user.id);

  return (
    <div className="faculty-dashboard">
      <div className="dashboard-header">
        <h2>Faculty Dashboard</h2>
        <p>Welcome back, {user.name}!</p>
      </div>

      {/* Faculty Info Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{facultySubjects.length}</h3>
          <p>Subjects Teaching</p>
        </div>
        <div className="stat-card">
          <h3>{monitoringDivision ? 1 : 0}</h3>
          <p>Division Monitoring</p>
        </div>
        <div className="stat-card">
          <h3>{facultyTimetables.length}</h3>
          <p>Generated Timetables</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="management-section">
        <h3>Quick Actions</h3>
        <div className="management-grid">
          {monitoringDivision && (
            <Link to="/faculty/generate-timetable" className="management-card">
              <div className="card-icon">📅</div>
              <h4>Generate Timetable</h4>
              <p>For {monitoringDivision.name}</p>
            </Link>
          )}
          <div className="management-card">
            <div className="card-icon">📚</div>
            <h4>My Subjects</h4>
            <p>{facultySubjects.length} subjects assigned</p>
          </div>
        </div>
      </div>

      {/* My Subjects */}
      <div className="subjects-section">
        <h3>My Subjects</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Code</th>
                <th>Type</th>
                <th>Lectures/Week</th>
              </tr>
            </thead>
            <tbody>
              {facultySubjects.map(subject => (
                <tr key={subject.id}>
                  <td>{subject.name}</td>
                  <td>{subject.code}</td>
                  <td>
                    <span className={`type-badge ${subject.type.toLowerCase()}`}>
                      {subject.type}
                    </span>
                  </td>
                  <td>{subject.lecturesPerWeek}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monitoring Division Info */}
      {monitoringDivision && (
        <div className="monitoring-section">
          <h3>Monitoring Division: {monitoringDivision.name}</h3>
          <div className="division-info">
            <p><strong>Student Count:</strong> {monitoringDivision.studentCount}</p>
            <p><strong>Subjects:</strong> {monitoringDivision.subjects?.length || 0}</p>
            <p><strong>Last Timetable:</strong> {
              facultyTimetables.length > 0 
                ? new Date(facultyTimetables[facultyTimetables.length - 1].generatedAt).toLocaleDateString()
                : 'Not generated yet'
            }</p>
          </div>
        </div>
      )}

      {!monitoringDivision && (
        <div className="no-monitoring">
          <p>You are not assigned as a monitor for any division.</p>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
