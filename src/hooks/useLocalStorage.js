// src/hooks/useLocalStorage.js

import { useState, useEffect } from 'react';

/**
 * Custom hook for localStorage management
 * @param {string} key - The localStorage key
 * @param {any} initialValue - Initial value if key doesn't exist
 * @returns {[value, setValue, removeValue]} - Current value, setter function, and remove function
 */
export const useLocalStorage = (key, initialValue) => {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Set value in localStorage and state
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Remove value from localStorage and reset to initial value
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
};

/**
 * Hook for managing multiple localStorage keys as a single object
 * @param {Object} initialData - Object with key-value pairs for localStorage
 * @returns {[data, updateData, clearData]} - Current data, update function, and clear function
 */
export const useMultipleLocalStorage = (initialData) => {
  const [data, setData] = useState(() => {
    const result = {};
    Object.keys(initialData).forEach(key => {
      try {
        const item = window.localStorage.getItem(key);
        result[key] = item ? JSON.parse(item) : initialData[key];
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        result[key] = initialData[key];
      }
    });
    return result;
  });

  // Update specific key
  const updateData = (key, value) => {
    try {
      const valueToStore = value instanceof Function ? value(data[key]) : value;
      setData(prev => ({ ...prev, [key]: valueToStore }));
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Clear all data
  const clearData = () => {
    try {
      Object.keys(initialData).forEach(key => {
        window.localStorage.removeItem(key);
      });
      setData(initialData);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  return [data, updateData, clearData];
};

/**
 * Hook for session storage (data cleared when tab closes)
 * @param {string} key - The sessionStorage key
 * @param {any} initialValue - Initial value if key doesn't exist
 * @returns {[value, setValue, removeValue]} - Current value, setter function, and remove function
 */
export const useSessionStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      window.sessionStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
};

/**
 * Hook for managing array data in localStorage with common operations
 * @param {string} key - The localStorage key
 * @param {Array} initialValue - Initial array value
 * @returns {Object} - Object with array and manipulation functions
 */
export const useLocalStorageArray = (key, initialValue = []) => {
  const [array, setArray] = useLocalStorage(key, initialValue);

  const addItem = (item) => {
    setArray(prev => [...prev, item]);
  };

  const removeItem = (id) => {
    setArray(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id, updatedItem) => {
    setArray(prev => prev.map(item => 
      item.id === id ? { ...item, ...updatedItem } : item
    ));
  };

  const findItem = (id) => {
    return array.find(item => item.id === id);
  };

  const clearArray = () => {
    setArray([]);
  };

  const replaceArray = (newArray) => {
    setArray(newArray);
  };

  return {
    items: array,
    addItem,
    removeItem,
    updateItem,
    findItem,
    clearArray,
    replaceArray,
    setItems: setArray
  };
};

/**
 * Hook for managing object data in localStorage with common operations
 * @param {string} key - The localStorage key
 * @param {Object} initialValue - Initial object value
 * @returns {Object} - Object with data and manipulation functions
 */
export const useLocalStorageObject = (key, initialValue = {}) => {
  const [object, setObject] = useLocalStorage(key, initialValue);

  const updateProperty = (property, value) => {
    setObject(prev => ({ ...prev, [property]: value }));
  };

  const removeProperty = (property) => {
    setObject(prev => {
      const newObj = { ...prev };
      delete newObj[property];
      return newObj;
    });
  };

  const mergeObject = (newData) => {
    setObject(prev => ({ ...prev, ...newData }));
  };

  const resetObject = () => {
    setObject(initialValue);
  };

  return {
    data: object,
    updateProperty,
    removeProperty,
    mergeObject,
    resetObject,
    setData: setObject
  };
};

/**
 * Utility function to check if localStorage is available
 * @returns {boolean} - True if localStorage is available
 */
export const isLocalStorageAvailable = () => {
  try {
    const test = '__localStorage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Utility function to get localStorage usage
 * @returns {Object} - Object with used and total storage info
 */
export const getLocalStorageUsage = () => {
  if (!isLocalStorageAvailable()) {
    return { used: 0, total: 0, percentage: 0 };
  }

  let used = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage[key].length + key.length;
    }
  }

  const total = 5 * 1024 * 1024; // 5MB typical limit
  const percentage = (used / total) * 100;

  return {
    used: used,
    total: total,
    percentage: Math.round(percentage * 100) / 100,
    usedFormatted: `${(used / 1024).toFixed(2)} KB`,
    totalFormatted: `${(total / 1024 / 1024).toFixed(2)} MB`
  };
};

/**
 * Utility function to clear all app-related localStorage data
 * @param {Array} keys - Array of keys to clear
 */
export const clearAppStorage = (keys) => {
  try {
    keys.forEach(key => {
      window.localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing app storage:', error);
  }
};
