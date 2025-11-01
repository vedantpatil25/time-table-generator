// src/components/admin/SubjectManagement.jsx

import React, { useState } from 'react';
import { useData } from '../../context/DataContext.jsx';
import { SUBJECT_TYPES } from '../../utils/constants.js';

const SubjectManagement = () => {
  const { subjects, saveSubjects } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: SUBJECT_TYPES.THEORY,
    lecturesPerWeek: 3,
    duration: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const subjectData = {
      id: editingSubject ? editingSubject.id : `sub_${Date.now()}`,
      ...formData,
      lecturesPerWeek: parseInt(formData.lecturesPerWeek),
      duration: parseInt(formData.duration)
    };

    let updatedSubjects;
    if (editingSubject) {
      updatedSubjects = subjects.map(s => 
        s.id === editingSubject.id ? subjectData : s
      );
    } else {
      updatedSubjects = [...subjects, subjectData];
    }

    saveSubjects(updatedSubjects);
    resetForm();
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      type: subject.type,
      lecturesPerWeek: subject.lecturesPerWeek,
      duration: subject.duration
    });
    setShowForm(true);
  };

  const handleDelete = (subjectId) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      const updatedSubjects = subjects.filter(s => s.id !== subjectId);
      saveSubjects(updatedSubjects);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: SUBJECT_TYPES.THEORY,
      lecturesPerWeek: 3,
      duration: 1
    });
    setEditingSubject(null);
    setShowForm(false);
  };

  return (
    <div className="subject-management">
      <div className="table-header">
        <h2>Subject Management</h2>
        <button onClick={() => setShowForm(true)}>Add Subject</button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Subject Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  required
                  placeholder="e.g., Data Structures and Algorithms"
                />
              </div>
              <div className="form-group">
                <label>Subject Code:</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({...prev, code: e.target.value}))}
                  required
                  placeholder="e.g., CS201"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Type:</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({...prev, type: e.target.value}))}
                  required
                >
                  <option value={SUBJECT_TYPES.THEORY}>Theory</option>
                  <option value={SUBJECT_TYPES.LAB}>Lab</option>
                  <option value={SUBJECT_TYPES.TECHNICAL_TRAINING}>Technical Training</option>
                </select>
              </div>
              <div className="form-group">
                <label>Lectures Per Week:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.lecturesPerWeek}
                  onChange={(e) => setFormData(prev => ({...prev, lecturesPerWeek: e.target.value}))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration (Hours):</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({...prev, duration: e.target.value}))}
                  required
                />
              </div>
            </div>

            <div style={{display: 'flex', gap: '1rem'}}>
              <button type="submit">
                {editingSubject ? 'Update' : 'Add'} Subject
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
              <th>Subject Name</th>
              <th>Code</th>
              <th>Type</th>
              <th>Lectures/Week</th>
              <th>Duration (Hours)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(subject => (
              <tr key={subject.id}>
                <td>{subject.name}</td>
                <td>{subject.code}</td>
                <td>
                  <span className={`type-badge ${subject.type.toLowerCase()}`}>
                    {subject.type}
                  </span>
                </td>
                <td>{subject.lecturesPerWeek}</td>
                <td>{subject.duration}</td>
                <td>
                  <button 
                    className="btn-small btn-edit"
                    onClick={() => handleEdit(subject)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-small btn-delete"
                    onClick={() => handleDelete(subject.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubjectManagement;
