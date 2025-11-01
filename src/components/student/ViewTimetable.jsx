// src/components/student/ViewTimetable.jsx

import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useTimetable } from '../../context/TimetableContext.jsx';
import { DAYS_OF_WEEK } from '../../utils/constants.js';

const ViewTimetable = () => {
  const { user } = useAuth();
  const { divisions, subjects, faculties, classrooms, timeSlots } = useData();
  const { timetables } = useTimetable();

  const studentDivision = divisions.find(d => d.id === user.divisionId);
  const divisionTimetable = timetables.find(tt => tt.divisionId === user.divisionId);

  if (!studentDivision) {
    return (
      <div className="view-timetable">
        <h2>View Timetable</h2>
        <p>Division not found.</p>
      </div>
    );
  }

  if (!divisionTimetable) {
    return (
      <div className="view-timetable">
        <h2>Timetable - {studentDivision.name}</h2>
        <div className="no-timetable">
          <p>Timetable has not been generated for your division yet.</p>
          <p>Please contact your monitor faculty for updates.</p>
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
    divisionTimetable.entries.forEach(entry => {
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
    <div className="view-timetable">
      <div className="timetable-header">
        <h2>Timetable - {studentDivision.name}</h2>
        <p>Generated on: {new Date(divisionTimetable.generatedAt).toLocaleDateString()}</p>
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
                      <div className="subject-info">
                        <div className="subject-name">{entry.subject?.name}</div>
                        <div className="faculty-name">{entry.faculty?.name}</div>
                        <div className="classroom-name">{entry.classroom?.name}</div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
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
    </div>
  );
};

export default ViewTimetable;
