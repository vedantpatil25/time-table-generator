// src/components/timetable/TimetableGrid.jsx

import React from 'react';
import { DAYS_OF_WEEK } from '../../utils/constants.js';

const TimetableGrid = ({ 
  timetable, 
  subjects, 
  faculties, 
  classrooms, 
  timeSlots,
  showLegend = true,
  title = "Timetable"
}) => {
  if (!timetable || !timetable.entries) {
    return (
      <div className="timetable-container">
        <h3>{title}</h3>
        <div className="no-timetable">
          <p>No timetable data available</p>
        </div>
      </div>
    );
  }

  // Create timetable grid
  const createTimetableGrid = () => {
    const grid = {};
    
    // Initialize grid
    DAYS_OF_WEEK.forEach(day => {
      grid[day] = {};
      timeSlots.forEach(slot => {
        grid[day][slot.id] = null;
      });
    });

    // Fill grid with timetable entries
    timetable.entries.forEach(entry => {
      if (grid[entry.day]) {
        const subject = subjects.find(s => s.id === entry.subjectId);
        const faculty = faculties.find(f => f.id === entry.facultyId);
        const classroom = classrooms.find(c => c.id === entry.classroomId);
        
        grid[entry.day][entry.timeSlotId] = {
          subject,
          faculty,
          classroom,
          isLunch: entry.isLunch
        };
      }
    });

    return grid;
  };

  const timetableGrid = createTimetableGrid();

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="timetable-display">
      <div className="timetable-header">
        <h3>{title}</h3>
        {timetable.generatedAt && (
          <p>Generated on: {new Date(timetable.generatedAt).toLocaleDateString()}</p>
        )}
      </div>

      <div className="timetable-container">
        <table className="timetable-table">
          <thead>
            <tr>
              <th>Time</th>
              {DAYS_OF_WEEK.map(day => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(slot => (
              <tr key={slot.id}>
                <td className="time-slot">
                  <div>{formatTime(slot.startTime)}</div>
                  <div>{formatTime(slot.endTime)}</div>
                </td>
                {DAYS_OF_WEEK.map(day => {
                  const entry = timetableGrid[day][slot.id];
                  
                  if (slot.isLunch) {
                    return (
                      <td key={day} className="lunch-cell">
                        <div className="lunch-break">LUNCH</div>
                      </td>
                    );
                  }

                  if (!entry) {
                    return <td key={day} className="empty-cell">-</td>;
                  }

                  return (
                    <td key={day} className="subject-cell">
                      <div className={`subject-info ${entry.subject?.type?.toLowerCase() || ''}`}>
                        <div className="subject-name">{entry.subject?.code || 'N/A'}</div>
                        <div className="faculty-name">{entry.faculty?.name || 'N/A'}</div>
                        <div className="classroom-name">{entry.classroom?.name || 'N/A'}</div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showLegend && (
        <div className="timetable-legend">
          <h4>Legend:</h4>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color theory"></span>
              <span>Theory Classes</span>
            </div>
            <div className="legend-item">
              <span className="legend-color lab"></span>
              <span>Lab Classes</span>
            </div>
            <div className="legend-item">
              <span className="legend-color lunch"></span>
              <span>Lunch Break</span>
            </div>
          </div>
        </div>
      )}

      {timetable.conflicts && timetable.conflicts.length > 0 && (
        <div className="timetable-conflicts">
          <h4>Conflicts:</h4>
          <ul>
            {timetable.conflicts.map((conflict, index) => (
              <li key={index} className="conflict-item">{conflict}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TimetableGrid;
