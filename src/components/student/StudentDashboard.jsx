// src/components/student/StudentDashboard.jsx

import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useTimetable } from '../../context/TimetableContext.jsx';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { divisions, subjects, faculties } = useData();
  const { timetables } = useTimetable();

  // Get student's division
  const studentDivision = divisions.find(d => d.id === user.divisionId);
  const divisionSubjects = subjects.filter(s => studentDivision?.subjects?.includes(s.id));
  const divisionTimetable = timetables.find(tt => tt.divisionId === user.divisionId);
  const monitorFaculty = faculties.find(f => f.id === studentDivision?.monitorFacultyId);

  // Calculate subject statistics
  const theorySubjects = divisionSubjects.filter(s => s.type === 'Theory');
  const labSubjects = divisionSubjects.filter(s => s.type === 'Lab');
  const totalLectures = divisionSubjects.reduce((sum, s) => sum + s.lecturesPerWeek, 0);

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h2>Student Dashboard</h2>
        <p>Welcome back, {user.name}!</p>
        {user.rollNumber && <p>Roll Number: {user.rollNumber}</p>}
      </div>

      {/* Division Info */}
      {studentDivision && (
        <div className="division-card">
          <h3>Division: {studentDivision.name}</h3>
          <div className="division-details">
            <p><strong>Monitor Faculty:</strong> {monitorFaculty?.name || 'Not assigned'}</p>
            <p><strong>Total Students:</strong> {studentDivision.studentCount}</p>
            <p><strong>Total Subjects:</strong> {divisionSubjects.length}</p>
            <p><strong>Weekly Lectures:</strong> {totalLectures}</p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{theorySubjects.length}</h3>
          <p>Theory Subjects</p>
        </div>
        <div className="stat-card">
          <h3>{labSubjects.length}</h3>
          <p>Lab Subjects</p>
        </div>
        <div className="stat-card">
          <h3>{totalLectures}</h3>
          <p>Weekly Lectures</p>
        </div>
        <div className="stat-card">
          <h3>{divisionTimetable ? 'Available' : 'Not Available'}</h3>
          <p>Timetable Status</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="management-section">
        <h3>Quick Actions</h3>
        <div className="management-grid">
          <Link to="/student/view-timetable" className="management-card">
            <div className="card-icon">📅</div>
            <h4>View Timetable</h4>
            <p>Check your class schedule</p>
          </Link>
          <div className="management-card">
            <div className="card-icon">📚</div>
            <h4>My Subjects</h4>
            <p>{divisionSubjects.length} subjects this semester</p>
          </div>
        </div>
      </div>

      {/* Subjects List */}
      <div className="subjects-section">
        <h3>My Subjects</h3>
        <div className="subjects-grid">
          {divisionSubjects.map(subject => (
            <div key={subject.id} className="subject-card">
              <h4>{subject.name}</h4>
              <p><strong>Code:</strong> {subject.code}</p>
              <p><strong>Type:</strong> 
                <span className={`type-badge ${subject.type.toLowerCase()}`}>
                  {subject.type}
                </span>
              </p>
              <p><strong>Lectures/Week:</strong> {subject.lecturesPerWeek}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timetable Status */}
      <div className="timetable-status">
        <h3>Timetable Status</h3>
        {divisionTimetable ? (
          <div className="timetable-available">
            <p>✅ Timetable is available for your division</p>
            <p><strong>Generated on:</strong> {new Date(divisionTimetable.generatedAt).toLocaleDateString()}</p>
            <Link to="/student/view-timetable" className="btn-primary">
              View Timetable
            </Link>
          </div>
        ) : (
          <div className="timetable-unavailable">
            <p>⏳ Timetable not yet generated for your division</p>
            <p>Please contact your monitor faculty for updates.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
