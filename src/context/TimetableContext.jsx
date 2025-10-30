// src/context/TimetableContext.jsx

import React, { createContext, useContext, useState } from 'react';
import { STORAGE_KEYS } from '../utils/constants.js';

const TimetableContext = createContext();

export const TimetableProvider = ({ children }) => {
  const [timetables, setTimetables] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TIMETABLES) || '[]');
    } catch {
      return [];
    }
  });
  const [generating, setGenerating] = useState(false);

  // Save timetable
  const saveTimetable = (timetable) => {
    const newTimetables = [...timetables, timetable];
    setTimetables(newTimetables);
    localStorage.setItem(STORAGE_KEYS.TIMETABLES, JSON.stringify(newTimetables));
  };

  // Get timetable by division
  const getTimetableByDivision = (divisionId) => {
    return timetables.find(tt => tt.divisionId === divisionId);
  };

  // Delete timetable
  const deleteTimetable = (timetableId) => {
    const newTimetables = timetables.filter(tt => tt.id !== timetableId);
    setTimetables(newTimetables);
    localStorage.setItem(STORAGE_KEYS.TIMETABLES, JSON.stringify(newTimetables));
  };

  const value = {
    timetables,
    generating,
    setGenerating,
    saveTimetable,
    getTimetableByDivision,
    deleteTimetable
  };

  return (
    <TimetableContext.Provider value={value}>
      {children}
    </TimetableContext.Provider>
  );
};

export const useTimetable = () => {
  const context = useContext(TimetableContext);
  if (!context) {
    throw new Error('useTimetable must be used within a TimetableProvider');
  }
  return context;
};
