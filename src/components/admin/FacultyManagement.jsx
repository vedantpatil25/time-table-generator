// src/components/admin/FacultyManagement.jsx

import React, { useState } from 'react';
import { useData } from '../../context/DataContext.jsx';

const FacultyManagement = () => {
  const { faculties, subjects, divisions, saveFaculties } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subjects: [],
    monitoringDivision: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const facultyData = {
      id: editingFaculty ? editingFaculty.id : `fac_${Date.now()}`,
      ...formData,
      role: 'faculty',
      password: 'faculty123' // Default password
    };

    let updatedFaculties;
    if (editingFaculty) {
      updatedFaculties = faculties.map(f => 
        f.id === editingFaculty.id ? facultyData : f
      );
    } else {
      updatedFaculties = [...faculties, facultyData];
    }

    saveFaculties(updatedFaculties);
    resetForm();
  };

  const handleEdit = (faculty) => {
    setEditingFaculty(faculty);
    setFormData({
      name: faculty.name,
      email: faculty.email,
      subjects: faculty.subjects || [],
      monitoringDivision: faculty.monitoringDivision || ''
    });
    setShowForm(true);
  };

  const handleDelete = (facultyId) => {
    if (confirm('Are you sure you want to delete this faculty?')) {
      const updatedFaculties = faculties.filter(f => f.id !== facultyId);
      saveFaculties(updatedFaculties);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', subjects: [], monitoringDivision: '' });
    setEditingFaculty(null);
    setShowForm(false);
  };

  const handleSubjectChange = (subjectId, checked) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, subjectId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        subjects: prev.subjects.filter(id => id !== subjectId)
      }));
    }
  };

  return (
    <div className="faculty-management">
      <div className="table-header">
        <h2>Faculty Management</h2>
        <button onClick={() => setShowForm(true)}>Add Faculty</button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>{editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Subjects Teaching:</label>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem'}}>
                {subjects.map(subject => (
                  <label key={subject.id} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes(subject.id)}
                      onChange={(e) => handleSubjectChange(subject.id, e.target.checked)}
                    />
                    {subject.name} ({subject.code})
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Monitoring Division:</label>
              <select
                value={formData.monitoringDivision}
                onChange={(e) => setFormData(prev => ({...prev, monitoringDivision: e.target.value}))}
              >
                <option value="">No Division</option>
                {divisions.map(division => (
                  <option key={division.id} value={division.id}>
                    {division.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{display: 'flex', gap: '1rem'}}>
              <button type="submit">
                {editingFaculty ? 'Update' : 'Add'} Faculty
              </button>
              <button type="button" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Subjects</th>
              <th>Monitoring Division</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {faculties.map(faculty => {
              const facultySubjects = subjects.filter(s => faculty.subjects?.includes(s.id));
              const monitoringDiv = divisions.find(d => d.id === faculty.monitoringDivision);
              
              return (
                <tr key={faculty.id}>
                  <td>{faculty.name}</td>
                  <td>{faculty.email}</td>
                  <td>{facultySubjects.map(s => s.code).join(', ')}</td>
                  <td>{monitoringDiv?.name || 'None'}</td>
                  <td>
                    <button 
                      className="btn-small btn-edit"
                      onClick={() => handleEdit(faculty)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-small btn-delete"
                      onClick={() => handleDelete(faculty.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacultyManagement;
