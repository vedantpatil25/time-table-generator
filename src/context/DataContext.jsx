// src/context/DataContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../utils/constants.js';
import { getInitialData } from '../data/mockData.js';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [faculties, setFaculties] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize data from localStorage or mock data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const stored = {
        faculties: JSON.parse(localStorage.getItem(STORAGE_KEYS.FACULTIES) || '[]'),
        subjects: JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBJECTS) || '[]'),
        classrooms: JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSROOMS) || '[]'),
        divisions: JSON.parse(localStorage.getItem(STORAGE_KEYS.DIVISIONS) || '[]'),
        timeSlots: JSON.parse(localStorage.getItem(STORAGE_KEYS.TIME_SLOTS) || '[]')
      };

      // If no data exists, initialize with mock data
      if (stored.faculties.length === 0) {
        const initialData = getInitialData();
        stored.faculties = initialData.faculties;
        stored.subjects = initialData.subjects;
        stored.classrooms = initialData.classrooms;
        stored.divisions = initialData.divisions;
        stored.timeSlots = initialData.timeSlots;

        // Save to localStorage
        localStorage.setItem(STORAGE_KEYS.FACULTIES, JSON.stringify(stored.faculties));
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(stored.subjects));
        localStorage.setItem(STORAGE_KEYS.CLASSROOMS, JSON.stringify(stored.classrooms));
        localStorage.setItem(STORAGE_KEYS.DIVISIONS, JSON.stringify(stored.divisions));
        localStorage.setItem(STORAGE_KEYS.TIME_SLOTS, JSON.stringify(stored.timeSlots));
      }

      setFaculties(stored.faculties);
      setSubjects(stored.subjects);
      setClassrooms(stored.classrooms);
      setDivisions(stored.divisions);
      setTimeSlots(stored.timeSlots);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save functions
  const saveFaculties = (newFaculties) => {
    setFaculties(newFaculties);
    localStorage.setItem(STORAGE_KEYS.FACULTIES, JSON.stringify(newFaculties));
  };

  const saveSubjects = (newSubjects) => {
    setSubjects(newSubjects);
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(newSubjects));
  };

  const saveClassrooms = (newClassrooms) => {
    setClassrooms(newClassrooms);
    localStorage.setItem(STORAGE_KEYS.CLASSROOMS, JSON.stringify(newClassrooms));
  };

  const saveDivisions = (newDivisions) => {
    setDivisions(newDivisions);
    localStorage.setItem(STORAGE_KEYS.DIVISIONS, JSON.stringify(newDivisions));
  };

  const saveTimeSlots = (newTimeSlots) => {
    setTimeSlots(newTimeSlots);
    localStorage.setItem(STORAGE_KEYS.TIME_SLOTS, JSON.stringify(newTimeSlots));
  };

  const value = {
    faculties,
    subjects,
    classrooms,
    divisions,
    timeSlots,
    loading,
    saveFaculties,
    saveSubjects,
    saveClassrooms,
    saveDivisions,
    saveTimeSlots,
    reloadData: loadData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
