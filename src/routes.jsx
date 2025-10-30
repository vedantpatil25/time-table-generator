// src/routes.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { DataProvider } from './context/DataContext.jsx';
import { TimetableProvider } from './context/TimetableContext.jsx';

import Layout from './components/common/Layout.jsx';
import Login from './components/auth/Login.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

// Admin Components (will create these next)
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import FacultyManagement from './components/admin/FacultyManagement.jsx';
import SubjectManagement from './components/admin/SubjectManagement.jsx';
import ClassroomManagement from './components/admin/ClassroomManagement.jsx';
import DivisionManagement from './components/admin/DivisionManagement.jsx';
import TimeSlotManagement from './components/admin/TimeSlotManagement.jsx';
import TimetableGenerator from './components/admin/TimetableGenerator.jsx';

// Faculty Components
import FacultyDashboard from './components/faculty/FacultyDashboard.jsx';
import GenerateMonitoringTimetable from './components/faculty/GenerateMonitoringTimetable.jsx';

// Student Components
import StudentDashboard from './components/student/StudentDashboard.jsx';
import ViewTimetable from './components/student/ViewTimetable.jsx';

// Unauthorized page
const Unauthorized = () => (
  <Layout>
    <div className="unauthorized">
      <h2>Unauthorized Access</h2>
      <p>You don't have permission to access this page.</p>
    </div>
  </Layout>
);

const AppRoutes = () => {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <TimetableProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <Layout><AdminDashboard /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/faculties" element={
                <ProtectedRoute requiredRole="admin">
                  <Layout><FacultyManagement /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/subjects" element={
                <ProtectedRoute requiredRole="admin">
                  <Layout><SubjectManagement /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/classrooms" element={
                <ProtectedRoute requiredRole="admin">
                  <Layout><ClassroomManagement /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/divisions" element={
                <ProtectedRoute requiredRole="admin">
                  <Layout><DivisionManagement /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/timeslots" element={
                <ProtectedRoute requiredRole="admin">
                  <Layout><TimeSlotManagement /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/generate-timetable" element={
                <ProtectedRoute requiredRole="admin">
                  <Layout><TimetableGenerator /></Layout>
                </ProtectedRoute>
              } />

              {/* Faculty Routes */}
              <Route path="/faculty/dashboard" element={
                <ProtectedRoute requiredRole="faculty">
                  <Layout><FacultyDashboard /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/faculty/generate-timetable" element={
                <ProtectedRoute requiredRole="faculty">
                  <Layout><GenerateMonitoringTimetable /></Layout>
                </ProtectedRoute>
              } />

              {/* Student Routes */}
              <Route path="/student/dashboard" element={
                <ProtectedRoute requiredRole="student">
                  <Layout><StudentDashboard /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/student/view-timetable" element={
                <ProtectedRoute requiredRole="student">
                  <Layout><ViewTimetable /></Layout>
                </ProtectedRoute>
              } />

              {/* Default Routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </TimetableProvider>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
};

export default AppRoutes;
