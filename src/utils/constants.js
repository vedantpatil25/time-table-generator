// src/utils/constants.js

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  FACULTY: "faculty",
  STUDENT: "student",
};

// Subject Types
export const SUBJECT_TYPES = {
  THEORY: "Theory",
  LAB: "Lab",
  TECHNICAL_TRAINING: "Technical training", // NEW
};

// Classroom Types
export const CLASSROOM_TYPES = {
  THEORY: "Theory",
  LAB: "Lab",
  TECHNICAL_TRAINING: "Technical training", // NEW
};

// Days of the Week
export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// In src/data/mockData.js - Replace DEFAULT_TIME_SLOTS
export const DEFAULT_TIME_SLOTS = [
  // Morning Session - 4 slots of 50 minutes each
  { id: "1", startTime: "09:10", endTime: "10:00", isLunch: false },
  { id: "2", startTime: "10:00", endTime: "10:50", isLunch: false },
  { id: "3", startTime: "10:50", endTime: "11:40", isLunch: false },
  { id: "4", startTime: "11:40", endTime: "12:30", isLunch: false },

  // Lunch Break - 40 minutes
  { id: "5", startTime: "12:30", endTime: "13:10", isLunch: true },

  // Afternoon Session - 4 slots of 50 minutes each
  { id: "6", startTime: "13:10", endTime: "14:00", isLunch: false },
  { id: "7", startTime: "14:00", endTime: "14:50", isLunch: false },
  { id: "8", startTime: "14:50", endTime: "15:40", isLunch: false },
  { id: "9", startTime: "15:40", endTime: "16:30", isLunch: false },
];

// Data Structure Definitions
export const DATA_MODELS = {
  // Faculty Model
  FACULTY: {
    id: "", // string
    name: "", // string
    email: "", // string
    subjects: [], // array of subject IDs
    monitoringDivision: null, // division ID or null
    password: "", // for login (in real app, this would be hashed)
  },

  // Subject Model
  SUBJECT: {
    id: "", // string
    name: "", // string
    code: "", // string (e.g., "CS101")
    type: "", // SUBJECT_TYPES.THEORY or SUBJECT_TYPES.LAB
    lecturesPerWeek: 0, // number
    duration: 1, // number of consecutive slots (usually 1, labs might be 2-3)
  },

  // Classroom Model
  CLASSROOM: {
    id: "", // string
    name: "", // string (e.g., "Room 101", "Lab A")
    type: "", // CLASSROOM_TYPES.THEORY or CLASSROOM_TYPES.LAB
    capacity: 0, // number of students
  },

  // Division Model
  DIVISION: {
    id: "", // string
    name: "", // string (e.g., "CS-A", "IT-B")
    monitorFacultyId: "", // faculty ID
    studentCount: 0, // number of students
    subjects: [], // array of subject IDs for this division
  },

  // Time Slot Model
  TIMESLOT: {
    id: "", // string
    startTime: "", // string (HH:MM format)
    endTime: "", // string (HH:MM format)
    isLunch: false, // boolean
  },

  // Timetable Entry Model
  TIMETABLE_ENTRY: {
    id: "", // string
    divisionId: "", // string
    day: "", // string (from DAYS_OF_WEEK)
    timeSlotId: "", // string
    subjectId: "", // string
    facultyId: "", // string
    classroomId: "", // string
    isLunch: false, // boolean
  },

  // Generated Timetable Model
  TIMETABLE: {
    id: "", // string
    divisionId: "", // string
    generatedBy: "", // faculty/admin ID
    generatedAt: "", // ISO date string
    entries: [], // array of TIMETABLE_ENTRY
    conflicts: [], // array of conflict descriptions
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  CURRENT_USER: "timetable_current_user",
  FACULTIES: "timetable_faculties",
  SUBJECTS: "timetable_subjects",
  CLASSROOMS: "timetable_classrooms",
  DIVISIONS: "timetable_divisions",
  TIME_SLOTS: "timetable_time_slots",
  TIMETABLES: "timetable_timetables",
};

// Default Admin User
export const DEFAULT_ADMIN = {
  id: "admin_001",
  name: "System Administrator",
  email: "admin@college.edu",
  role: USER_ROLES.ADMIN,
  password: "admin123",
};

// Validation Rules
export const VALIDATION_RULES = {
  MIN_LECTURES_PER_WEEK: 1,
  MAX_LECTURES_PER_WEEK: 10,
  MIN_CLASSROOM_CAPACITY: 10,
  MAX_CLASSROOM_CAPACITY: 200,
  MIN_STUDENT_COUNT: 10,
  MAX_STUDENT_COUNT: 120,
  MAX_SUBJECTS_PER_FACULTY: 5,
  MAX_DIVISIONS_PER_FACULTY: 1, // One faculty can monitor only one division
};

// UI Constants
export const UI_CONSTANTS = {
  ITEMS_PER_PAGE: 10,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  MODAL_ANIMATION_DURATION: 200,
};

// Timetable Generation Constraints
export const TIMETABLE_CONSTRAINTS = {
  // No faculty can teach in two places at the same time
  NO_FACULTY_CONFLICT: true,
  // No classroom can be used by two divisions at the same time
  NO_CLASSROOM_CONFLICT: true,
  // Lab subjects need lab classrooms, theory subjects need theory classrooms
  CLASSROOM_TYPE_MATCH: true,
  // Lunch break must be respected
  RESPECT_LUNCH_BREAK: true,
  // Try to distribute subjects evenly across the week
  EVEN_DISTRIBUTION: true,
};

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: "This field is required",
  INVALID_EMAIL: "Please enter a valid email address",
  INVALID_TIME_FORMAT: "Please enter time in HH:MM format",
  DUPLICATE_NAME: "This name already exists",
  INVALID_RANGE: "Please enter a valid range",
  GENERATION_FAILED: "Failed to generate timetable. Please check constraints.",
  LOGIN_FAILED: "Invalid credentials",
  UNAUTHORIZED: "You are not authorized to perform this action",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: "Data saved successfully",
  DELETED: "Data deleted successfully",
  UPDATED: "Data updated successfully",
  TIMETABLE_GENERATED: "Timetable generated successfully",
  LOGIN_SUCCESS: "Login successful",
};
