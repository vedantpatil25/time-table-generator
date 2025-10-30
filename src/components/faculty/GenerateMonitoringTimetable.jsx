// src/components/faculty/GenerateMonitoringTimetable.jsx

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useTimetable } from '../../context/TimetableContext.jsx';
import TimetableGrid from '../timetable/TimetableGrid.jsx';

const GenerateMonitoringTimetable = () => {
  const { user } = useAuth();
  const { divisions, subjects, faculties, classrooms, timeSlots } = useData();
  const { timetables, generating, setGenerating, saveTimetable, getTimetableByDivision } = useTimetable();
  const [generatedTimetable, setGeneratedTimetable] = useState(null);
  const [error, setError] = useState('');

  // Get faculty's monitoring division
  const monitoringDivision = divisions.find(d => d.id === user.monitoringDivision);
  const existingTimetable = getTimetableByDivision(user.monitoringDivision);

  // Simple timetable generation algorithm
  const generateTimetable = async () => {
    if (!monitoringDivision) {
      setError('No monitoring division assigned');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      // Simulate generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const divisionSubjects = subjects.filter(s => monitoringDivision.subjects?.includes(s.id));
      const availableClassrooms = classrooms.filter(c => 
        c.capacity >= monitoringDivision.studentCount
      );
      const lectureSlots = timeSlots.filter(slot => !slot.isLunch);

      if (divisionSubjects.length === 0) {
        throw new Error('No subjects assigned to this division');
      }

      if (availableClassrooms.length === 0) {
        throw new Error('No suitable classrooms available');
      }

      // Generate timetable entries
      const entries = [];
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      let subjectIndex = 0;
      let slotIndex = 0;

      // Simple round-robin assignment
      for (const day of days) {
        for (const slot of lectureSlots) {
          if (subjectIndex < divisionSubjects.length) {
            const subject = divisionSubjects[subjectIndex];
            
            // Find faculty teaching this subject
            const subjectFaculty = faculties.find(f => 
              f.subjects?.includes(subject.id)
            );

            // Find appropriate classroom
            const classroom = availableClassrooms.find(c => 
              subject.type === 'Lab' ? c.type === 'Lab' : c.type === 'Theory'
            ) || availableClassrooms[0];

            entries.push({
              id: `entry_${Date.now()}_${entries.length}`,
              divisionId: monitoringDivision.id,
              day,
              timeSlotId: slot.id,
              subjectId: subject.id,
              facultyId: subjectFaculty?.id || faculties[0]?.id,
              classroomId: classroom.id,
              isLunch: false
            });

            subjectIndex = (subjectIndex + 1) % divisionSubjects.length;
          }
        }
      }

      const newTimetable = {
        id: `tt_${Date.now()}`,
        divisionId: monitoringDivision.id,
        generatedBy: user.id,
        generatedAt: new Date().toISOString(),
        entries,
        conflicts: []
      };

      setGeneratedTimetable(newTimetable);

    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const saveFinalTimetable = () => {
    if (generatedTimetable) {
      saveTimetable(generatedTimetable);
      setGeneratedTimetable(null);
      alert('Timetable saved successfully!');
    }
  };

  const discardTimetable = () => {
    setGeneratedTimetable(null);
  };

  if (!monitoringDivision) {
    return (
      <div className="generate-timetable">
        <h2>Generate Timetable</h2>
        <div className="no-monitoring">
          <p>You are not assigned as a monitor for any division.</p>
          <p>Please contact the administrator to assign you a monitoring division.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="generate-timetable">
      <div className="page-header">
        <h2>Generate Timetable - {monitoringDivision.name}</h2>
        <p>Division: {monitoringDivision.name} | Students: {monitoringDivision.studentCount}</p>
      </div>

      {/* Division Info */}
      <div className="division-info-card">
        <h3>Division Information</h3>
        <div className="info-grid">
          <div>
            <strong>Division:</strong> {monitoringDivision.name}
          </div>
          <div>
            <strong>Students:</strong> {monitoringDivision.studentCount}
          </div>
          <div>
            <strong>Subjects:</strong> {monitoringDivision.subjects?.length || 0}
          </div>
          <div>
            <strong>Status:</strong> {existingTimetable ? 'Timetable exists' : 'No timetable'}
          </div>
        </div>
      </div>

      {/* Generation Controls */}
      <div className="generation-controls">
        {existingTimetable && (
          <div className="existing-timetable-warning">
            <p>⚠️ A timetable already exists for this division. Generating a new one will replace it.</p>
          </div>
        )}

        <div className="control-buttons">
          <button 
            onClick={generateTimetable}
            disabled={generating}
            className="btn-primary"
          >
            {generating ? 'Generating...' : 'Generate New Timetable'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        )}
      </div>

      {/* Generated Timetable Preview */}
      {generatedTimetable && (
        <div className="timetable-preview">
          <div className="preview-header">
            <h3>Generated Timetable Preview</h3>
            <div className="preview-actions">
              <button onClick={saveFinalTimetable} className="btn-success">
                Save Timetable
              </button>
              <button onClick={discardTimetable} className="btn-secondary">
                Discard
              </button>
            </div>
          </div>

          <TimetableGrid
            timetable={generatedTimetable}
            subjects={subjects}
            faculties={faculties}
            classrooms={classrooms}
            timeSlots={timeSlots}
            title={`${monitoringDivision.name} - Generated Timetable`}
          />
        </div>
      )}

      {/* Existing Timetable */}
      {existingTimetable && !generatedTimetable && (
        <div className="existing-timetable">
          <h3>Current Timetable</h3>
          <TimetableGrid
            timetable={existingTimetable}
            subjects={subjects}
            faculties={faculties}
            classrooms={classrooms}
            timeSlots={timeSlots}
            title={`${monitoringDivision.name} - Current Timetable`}
          />
        </div>
      )}
    </div>
  );
};

export default GenerateMonitoringTimetable;
