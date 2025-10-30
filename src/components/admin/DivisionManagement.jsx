// src/components/admin/DivisionManagement.jsx

import React, { useState } from 'react';
import { useData } from '../../context/DataContext.jsx';

const DivisionManagement = () => {
  const { divisions, faculties, subjects, saveDivisions } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingDivision, setEditingDivision] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    monitorFacultyId: '',
    studentCount: 50,
    subjects: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const divisionData = {
      id: editingDivision ? editingDivision.id : `div_${Date.now()}`,
      ...formData,
      studentCount: parseInt(formData.studentCount)
    };

    let updatedDivisions;
    if (editingDivision) {
      updatedDivisions = divisions.map(d => 
        d.id === editingDivision.id ? divisionData : d
      );
    } else {
      updatedDivisions = [...divisions, divisionData];
    }

    saveDivisions(updatedDivisions);
    resetForm();
  };

  const handleEdit = (division) => {
    setEditingDivision(division);
    setFormData({
      name: division.name,
      monitorFacultyId: division.monitorFacultyId,
      studentCount: division.studentCount,
      subjects: division.subjects || []
    });
    setShowForm(true);
  };

  const handleDelete = (divisionId) => {
    if (confirm('Are you sure you want to delete this division?')) {
      const updatedDivisions = divisions.filter(d => d.id !== divisionId);
      saveDivisions(updatedDivisions);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      monitorFacultyId: '',
      studentCount: 50,
      subjects: []
    });
    setEditingDivision(null);
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

  // Get available faculties (those not already monitoring a division)
  const getAvailableFaculties = () => {
    const assignedFacultyIds = divisions
      .filter(d => d.id !== editingDivision?.id)
      .map(d => d.monitorFacultyId);
    return faculties.filter(f => !assignedFacultyIds.includes(f.id));
  };

  return (
    <div className="division-management">
      <div className="table-header">
        <h2>Division Management</h2>
        <button onClick={() => setShowForm(true)}>Add Division</button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>{editingDivision ? 'Edit Division' : 'Add New Division'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Division Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  required
                  placeholder="e.g., CS-A, IT-B"
                />
              </div>
              <div className="form-group">
                <label>Monitor Faculty:</label>
                <select
                  value={formData.monitorFacultyId}
                  onChange={(e) => setFormData(prev => ({...prev, monitorFacultyId: e.target.value}))}
                  required
                >
                  <option value="">Select Faculty</option>
                  {getAvailableFaculties().map(faculty => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Student Count:</label>
                <input
                  type="number"
                  min="10"
                  max="120"
                  value={formData.studentCount}
                  onChange={(e) => setFormData(prev => ({...prev, studentCount: e.target.value}))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Subjects for this Division:</label>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', padding: '1rem', borderRadius: '4px'}}>
                {subjects.map(subject => (
                  <label key={subject.id} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes(subject.id)}
                      onChange={(e) => handleSubjectChange(subject.id, e.target.checked)}
                    />
                    {subject.name} ({subject.code}) - {subject.type}
                  </label>
                ))}
              </div>
            </div>

            <div style={{display: 'flex', gap: '1rem'}}>
              <button type="submit">
                {editingDivision ? 'Update' : 'Add'} Division
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
              <th>Division Name</th>
              <th>Monitor Faculty</th>
              <th>Student Count</th>
              <th>Subjects Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {divisions.map(division => {
              const monitorFaculty = faculties.find(f => f.id === division.monitorFacultyId);
              const divisionSubjects = subjects.filter(s => division.subjects?.includes(s.id));
              
              return (
                <tr key={division.id}>
                  <td><strong>{division.name}</strong></td>
                  <td>{monitorFaculty?.name || 'Not Assigned'}</td>
                  <td>{division.studentCount} students</td>
                  <td>
                    {divisionSubjects.length} subjects
                    <div style={{fontSize: '0.8rem', color: '#666', marginTop: '0.25rem'}}>
                      {divisionSubjects.slice(0, 3).map(s => s.code).join(', ')}
                      {divisionSubjects.length > 3 && '...'}
                    </div>
                  </td>
                  <td>
                    <button 
                      className="btn-small btn-edit"
                      onClick={() => handleEdit(division)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-small btn-delete"
                      onClick={() => handleDelete(division.id)}
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

export default DivisionManagement;
