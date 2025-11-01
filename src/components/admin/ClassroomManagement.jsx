// src/components/admin/ClassroomManagement.jsx

import React, { useState } from 'react';
import { useData } from '../../context/DataContext.jsx';
import { CLASSROOM_TYPES } from '../../utils/constants.js';

const ClassroomManagement = () => {
  const { classrooms, saveClassrooms } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: CLASSROOM_TYPES.THEORY,
    capacity: 50
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const classroomData = {
      id: editingClassroom ? editingClassroom.id : `room_${Date.now()}`,
      ...formData,
      capacity: parseInt(formData.capacity)
    };

    let updatedClassrooms;
    if (editingClassroom) {
      updatedClassrooms = classrooms.map(c => 
        c.id === editingClassroom.id ? classroomData : c
      );
    } else {
      updatedClassrooms = [...classrooms, classroomData];
    }

    saveClassrooms(updatedClassrooms);
    resetForm();
  };

  const handleEdit = (classroom) => {
    setEditingClassroom(classroom);
    setFormData({
      name: classroom.name,
      type: classroom.type,
      capacity: classroom.capacity
    });
    setShowForm(true);
  };

  const handleDelete = (classroomId) => {
    if (confirm('Are you sure you want to delete this classroom?')) {
      const updatedClassrooms = classrooms.filter(c => c.id !== classroomId);
      saveClassrooms(updatedClassrooms);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: CLASSROOM_TYPES.THEORY,
      capacity: 50
    });
    setEditingClassroom(null);
    setShowForm(false);
  };

  // Separate classrooms by type for better organization
  const theoryRooms = classrooms.filter(c => c.type === CLASSROOM_TYPES.THEORY);
  const labRooms = classrooms.filter(c => c.type === CLASSROOM_TYPES.LAB);
  const technicalTrainingRooms = classrooms.filter(c => c.type === CLASSROOM_TYPES.TECHNICAL_TRAINING);

  return (
    <div className="classroom-management">
      <div className="table-header">
        <h2>Classroom Management</h2>
        <button onClick={() => setShowForm(true)}>Add Classroom</button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>{editingClassroom ? 'Edit Classroom' : 'Add New Classroom'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Classroom Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  required
                  placeholder="e.g., Room 101, Computer Lab A"
                />
              </div>
              <div className="form-group">
                <label>Type:</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({...prev, type: e.target.value}))}
                  required
                >
                  <option value={CLASSROOM_TYPES.THEORY}>Theory</option>
                  <option value={CLASSROOM_TYPES.LAB}>Lab</option>
                  <option value={CLASSROOM_TYPES.TECHNICAL_TRAINING}>Technical Training</option>
                </select>
              </div>
              <div className="form-group">
                <label>Capacity:</label>
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({...prev, capacity: e.target.value}))}
                  required
                />
              </div>
            </div>

            <div style={{display: 'flex', gap: '1rem'}}>
              <button type="submit">
                {editingClassroom ? 'Update' : 'Add'} Classroom
              </button>
              <button type="button" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Theory Classrooms */}
      <div className="classroom-section">
        <h3>Theory Classrooms ({theoryRooms.length})</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {theoryRooms.map(classroom => (
                <tr key={classroom.id}>
                  <td>{classroom.name}</td>
                  <td>
                    <span className="type-badge theory">
                      {classroom.type}
                    </span>
                  </td>
                  <td>{classroom.capacity} students</td>
                  <td>
                    <button 
                      className="btn-small btn-edit"
                      onClick={() => handleEdit(classroom)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-small btn-delete"
                      onClick={() => handleDelete(classroom.id)}
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

      {/* Lab Classrooms */}
      <div className="classroom-section">
        <h3>Lab Classrooms ({labRooms.length})</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {labRooms.map(classroom => (
                <tr key={classroom.id}>
                  <td>{classroom.name}</td>
                  <td>
                    <span className="type-badge lab">
                      {classroom.type}
                    </span>
                  </td>
                  <td>{classroom.capacity} students</td>
                  <td>
                    <button 
                      className="btn-small btn-edit"
                      onClick={() => handleEdit(classroom)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-small btn-delete"
                      onClick={() => handleDelete(classroom.id)}
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

      {/* Technical Training Classrooms */}
      <div className="classroom-section">
        <h3>Technical Training Classrooms ({technicalTrainingRooms.length})</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {technicalTrainingRooms.map(classroom => (
                <tr key={classroom.id}>
                  <td>{classroom.name}</td>
                  <td>
                    <span className="type-badge technical-training">
                      {classroom.type}
                    </span>
                  </td>
                  <td>{classroom.capacity} students</td>
                  <td>
                    <button 
                      className="btn-small btn-edit"
                      onClick={() => handleEdit(classroom)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-small btn-delete"
                      onClick={() => handleDelete(classroom.id)}
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

      {/* Summary */}
      <div style={{marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px'}}>
        <h4>Classroom Summary</h4>
        <div style={{display: 'flex', gap: '2rem'}}>
          <p>Theory: {theoryRooms.length} rooms</p>
          <p>Lab: {labRooms.length} rooms</p>
          <p>Technical Training: {technicalTrainingRooms.length} rooms</p>
          <p><strong>Total: {classrooms.length} rooms</strong></p>
        </div>
      </div>
    </div>
  );
};

export default ClassroomManagement;
