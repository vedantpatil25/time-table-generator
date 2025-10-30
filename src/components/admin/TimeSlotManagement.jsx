// src/components/admin/TimeSlotManagement.jsx

import React, { useState } from 'react';
import { useData } from '../../context/DataContext.jsx';

const TimeSlotManagement = () => {
  const { timeSlots, saveTimeSlots } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    isLunch: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate time format and logic
    if (formData.startTime >= formData.endTime) {
      alert('End time must be after start time');
      return;
    }

    const slotData = {
      id: editingSlot ? editingSlot.id : Date.now().toString(),
      ...formData
    };

    let updatedSlots;
    if (editingSlot) {
      updatedSlots = timeSlots.map(s => 
        s.id === editingSlot.id ? slotData : s
      );
    } else {
      updatedSlots = [...timeSlots, slotData];
    }

    // Sort by start time
    updatedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

    saveTimeSlots(updatedSlots);
    resetForm();
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      startTime: slot.startTime,
      endTime: slot.endTime,
      isLunch: slot.isLunch
    });
    setShowForm(true);
  };

  const handleDelete = (slotId) => {
    if (confirm('Are you sure you want to delete this time slot?')) {
      const updatedSlots = timeSlots.filter(s => s.id !== slotId);
      saveTimeSlots(updatedSlots);
    }
  };

  const resetForm = () => {
    setFormData({
      startTime: '',
      endTime: '',
      isLunch: false
    });
    setEditingSlot(null);
    setShowForm(false);
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeStr);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="timeslot-management">
      <div className="table-header">
        <h2>Time Slot Management</h2>
        <button onClick={() => setShowForm(true)}>Add Time Slot</button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>{editingSlot ? 'Edit Time Slot' : 'Add New Time Slot'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Start Time:</label>
                <select
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({...prev, startTime: e.target.value}))}
                  required
                >
                  <option value="">Select Start Time</option>
                  {timeOptions.map(time => (
                    <option key={time} value={time}>
                      {formatTime(time)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>End Time:</label>
                <select
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({...prev, endTime: e.target.value}))}
                  required
                >
                  <option value="">Select End Time</option>
                  {timeOptions.map(time => (
                    <option key={time} value={time}>
                      {formatTime(time)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <input
                    type="checkbox"
                    checked={formData.isLunch}
                    onChange={(e) => setFormData(prev => ({...prev, isLunch: e.target.checked}))}
                  />
                  Lunch Break
                </label>
              </div>
            </div>

            <div style={{display: 'flex', gap: '1rem'}}>
              <button type="submit">
                {editingSlot ? 'Update' : 'Add'} Time Slot
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
              <th>Start Time</th>
              <th>End Time</th>
              <th>Duration</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(slot => {
              const duration = new Date(`2000-01-01T${slot.endTime}`) - new Date(`2000-01-01T${slot.startTime}`);
              const durationMinutes = duration / (1000 * 60);
              
              return (
                <tr key={slot.id} className={slot.isLunch ? 'lunch-row' : ''}>
                  <td>{formatTime(slot.startTime)}</td>
                  <td>{formatTime(slot.endTime)}</td>
                  <td>{durationMinutes} minutes</td>
                  <td>
                    {slot.isLunch ? (
                      <span className="type-badge lunch">Lunch Break</span>
                    ) : (
                      <span className="type-badge lecture">Lecture</span>
                    )}
                  </td>
                  <td>
                    <button 
                      className="btn-small btn-edit"
                      onClick={() => handleEdit(slot)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-small btn-delete"
                      onClick={() => handleDelete(slot.id)}
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

      <div style={{marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px'}}>
        <h4>Schedule Overview</h4>
        <p>Total Slots: {timeSlots.length}</p>
        <p>Lecture Slots: {timeSlots.filter(s => !s.isLunch).length}</p>
        <p>Lunch Breaks: {timeSlots.filter(s => s.isLunch).length}</p>
      </div>
    </div>
  );
};

export default TimeSlotManagement;
