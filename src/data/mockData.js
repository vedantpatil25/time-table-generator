// src/data/mockData.js

import { 
  USER_ROLES, 
  SUBJECT_TYPES, 
  CLASSROOM_TYPES, 
  DEFAULT_TIME_SLOTS,
  DEFAULT_ADMIN 
} from '../utils/constants.js';

// Sample Subjects
export const MOCK_SUBJECTS = [
  {
    id: 'sub_001',
    name: 'Data Structures and Algorithms',
    code: 'CS201',
    type: SUBJECT_TYPES.THEORY,
    lecturesPerWeek: 4,
    duration: 1
  },
  {
    id: 'sub_002',
    name: 'Database Management Systems',
    code: 'CS202',
    type: SUBJECT_TYPES.THEORY,
    lecturesPerWeek: 3,
    duration: 1
  },
  {
    id: 'sub_003',
    name: 'Data Structures Lab',
    code: 'CS201L',
    type: SUBJECT_TYPES.LAB,
    lecturesPerWeek: 2,
    duration: 2 // 2-hour lab sessions
  },
  {
    id: 'sub_004',
    name: 'DBMS Lab',
    code: 'CS202L',
    type: SUBJECT_TYPES.LAB,
    lecturesPerWeek: 2,
    duration: 2
  },
  {
    id: 'sub_005',
    name: 'Operating Systems',
    code: 'CS203',
    type: SUBJECT_TYPES.THEORY,
    lecturesPerWeek: 4,
    duration: 1
  },
  {
    id: 'sub_006',
    name: 'Computer Networks',
    code: 'CS204',
    type: SUBJECT_TYPES.THEORY,
    lecturesPerWeek: 3,
    duration: 1
  },
  {
    id: 'sub_007',
    name: 'Operating Systems Lab',
    code: 'CS203L',
    type: SUBJECT_TYPES.LAB,
    lecturesPerWeek: 2,
    duration: 2
  },
  {
    id: 'sub_008',
    name: 'Web Development',
    code: 'CS205',
    type: SUBJECT_TYPES.THEORY,
    lecturesPerWeek: 3,
    duration: 1
  },
  {
    id: 'sub_009',
    name: 'Web Development Lab',
    code: 'CS205L',
    type: SUBJECT_TYPES.LAB,
    lecturesPerWeek: 2,
    duration: 2
  },
  {
    id: 'sub_010',
    name: 'Software Engineering',
    code: 'CS206',
    type: SUBJECT_TYPES.THEORY,
    lecturesPerWeek: 3,
    duration: 1
  }
];

// Sample Classrooms
export const MOCK_CLASSROOMS = [
  {
    id: 'room_001',
    name: 'Room 101',
    type: CLASSROOM_TYPES.THEORY,
    capacity: 60
  },
  {
    id: 'room_002',
    name: 'Room 102',
    type: CLASSROOM_TYPES.THEORY,
    capacity: 50
  },
  {
    id: 'room_003',
    name: 'Room 103',
    type: CLASSROOM_TYPES.THEORY,
    capacity: 70
  },
  {
    id: 'room_004',
    name: 'Room 201',
    type: CLASSROOM_TYPES.THEORY,
    capacity: 80
  },
  {
    id: 'room_005',
    name: 'Room 202',
    type: CLASSROOM_TYPES.THEORY,
    capacity: 60
  },
  {
    id: 'lab_001',
    name: 'Computer Lab A',
    type: CLASSROOM_TYPES.LAB,
    capacity: 30
  },
  {
    id: 'lab_002',
    name: 'Computer Lab B',
    type: CLASSROOM_TYPES.LAB,
    capacity: 35
  },
  {
    id: 'lab_003',
    name: 'Computer Lab C',
    type: CLASSROOM_TYPES.LAB,
    capacity: 40
  },
  {
    id: 'lab_004',
    name: 'Network Lab',
    type: CLASSROOM_TYPES.LAB,
    capacity: 25
  },
  {
    id: 'lab_005',
    name: 'Software Lab',
    type: CLASSROOM_TYPES.LAB,
    capacity: 30
  }
];

// Sample Divisions
export const MOCK_DIVISIONS = [
  {
    id: 'div_001',
    name: 'CS-A',
    monitorFacultyId: 'fac_001',
    studentCount: 55,
    subjects: ['sub_001', 'sub_002', 'sub_003', 'sub_004', 'sub_005', 'sub_007']
  },
  {
    id: 'div_002',
    name: 'CS-B',
    monitorFacultyId: 'fac_002',
    studentCount: 52,
    subjects: ['sub_001', 'sub_002', 'sub_003', 'sub_004', 'sub_006', 'sub_008', 'sub_009']
  },
  {
    id: 'div_003',
    name: 'IT-A',
    monitorFacultyId: 'fac_003',
    studentCount: 48,
    subjects: ['sub_005', 'sub_006', 'sub_007', 'sub_008', 'sub_009', 'sub_010']
  },
  {
    id: 'div_004',
    name: 'IT-B',
    monitorFacultyId: 'fac_004',
    studentCount: 50,
    subjects: ['sub_002', 'sub_004', 'sub_005', 'sub_006', 'sub_010']
  }
];

// Sample Faculty
export const MOCK_FACULTIES = [
  {
    id: 'fac_001',
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@college.edu',
    subjects: ['sub_001', 'sub_003'], // DSA Theory & Lab
    monitoringDivision: 'div_001',
    password: 'faculty123',
    role: USER_ROLES.FACULTY
  },
  {
    id: 'fac_002',
    name: 'Prof. Priya Sharma',
    email: 'priya.sharma@college.edu',
    subjects: ['sub_002', 'sub_004'], // DBMS Theory & Lab
    monitoringDivision: 'div_002',
    password: 'faculty123',
    role: USER_ROLES.FACULTY
  },
  {
    id: 'fac_003',
    name: 'Dr. Amit Patel',
    email: 'amit.patel@college.edu',
    subjects: ['sub_005', 'sub_007'], // OS Theory & Lab
    monitoringDivision: 'div_003',
    password: 'faculty123',
    role: USER_ROLES.FACULTY
  },
  {
    id: 'fac_004',
    name: 'Prof. Sneha Gupta',
    email: 'sneha.gupta@college.edu',
    subjects: ['sub_006'], // Computer Networks
    monitoringDivision: 'div_004',
    password: 'faculty123',
    role: USER_ROLES.FACULTY
  },
  {
    id: 'fac_005',
    name: 'Dr. Vikram Singh',
    email: 'vikram.singh@college.edu',
    subjects: ['sub_008', 'sub_009'], // Web Development Theory & Lab
    monitoringDivision: null,
    password: 'faculty123',
    role: USER_ROLES.FACULTY
  },
  {
    id: 'fac_006',
    name: 'Prof. Kavita Joshi',
    email: 'kavita.joshi@college.edu',
    subjects: ['sub_010'], // Software Engineering
    monitoringDivision: null,
    password: 'faculty123',
    role: USER_ROLES.FACULTY
  },
  {
    id: 'fac_007',
    name: 'Dr. Suresh Reddy',
    email: 'suresh.reddy@college.edu',
    subjects: ['sub_001', 'sub_005'], // DSA & OS (backup faculty)
    monitoringDivision: null,
    password: 'faculty123',
    role: USER_ROLES.FACULTY
  }
];

// Sample Students (for login testing)
export const MOCK_STUDENTS = [
  {
    id: 'stu_001',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@student.edu',
    divisionId: 'div_001',
    rollNumber: 'CS001',
    password: 'student123',
    role: USER_ROLES.STUDENT
  },
  {
    id: 'stu_002',
    name: 'Riya Agarwal',
    email: 'riya.agarwal@student.edu',
    divisionId: 'div_002',
    rollNumber: 'CS051',
    password: 'student123',
    role: USER_ROLES.STUDENT
  },
  {
    id: 'stu_003',
    name: 'Karan Verma',
    email: 'karan.verma@student.edu',
    divisionId: 'div_003',
    rollNumber: 'IT001',
    password: 'student123',
    role: USER_ROLES.STUDENT
  },
  {
    id: 'stu_004',
    name: 'Pooja Nair',
    email: 'pooja.nair@student.edu',
    divisionId: 'div_004',
    rollNumber: 'IT051',
    password: 'student123',
    role: USER_ROLES.STUDENT
  }
];

// All Users Combined (for login)
export const MOCK_USERS = [
  DEFAULT_ADMIN,
  ...MOCK_FACULTIES,
  ...MOCK_STUDENTS
];

// Time Slots (using default from constants)
export const MOCK_TIME_SLOTS = DEFAULT_TIME_SLOTS;

// Sample Generated Timetable (for testing)
export const MOCK_TIMETABLE_ENTRIES = [
  {
    id: 'entry_001',
    divisionId: 'div_001',
    day: 'Monday',
    timeSlotId: '1',
    subjectId: 'sub_001',
    facultyId: 'fac_001',
    classroomId: 'room_001',
    isLunch: false
  },
  {
    id: 'entry_002',
    divisionId: 'div_001',
    day: 'Monday',
    timeSlotId: '2',
    subjectId: 'sub_002',
    facultyId: 'fac_002',
    classroomId: 'room_002',
    isLunch: false
  },
  // Add more sample entries as needed
];

export const MOCK_TIMETABLES = [
  {
    id: 'tt_001',
    divisionId: 'div_001',
    generatedBy: 'fac_001',
    generatedAt: new Date().toISOString(),
    entries: MOCK_TIMETABLE_ENTRIES,
    conflicts: []
  }
];

// Helper function to get initial data
export const getInitialData = () => ({
  subjects: MOCK_SUBJECTS,
  classrooms: MOCK_CLASSROOMS,
  divisions: MOCK_DIVISIONS,
  faculties: MOCK_FACULTIES,
  students: MOCK_STUDENTS,
  users: MOCK_USERS,
  timeSlots: MOCK_TIME_SLOTS,
  timetables: MOCK_TIMETABLES
});

// Helper function to get user by email and password
export const getUserByCredentials = (email, password) => {
  return MOCK_USERS.find(user => 
    user.email === email && user.password === password
  );
};

// Helper function to get division by student
export const getDivisionByStudent = (studentId) => {
  const student = MOCK_STUDENTS.find(s => s.id === studentId);
  if (!student) return null;
  return MOCK_DIVISIONS.find(d => d.id === student.divisionId);
};

// Helper function to get faculty's monitoring division
export const getFacultyMonitoringDivision = (facultyId) => {
  return MOCK_DIVISIONS.find(d => d.monitorFacultyId === facultyId);
};

// Helper function to get subjects by faculty
export const getSubjectsByFaculty = (facultyId) => {
  const faculty = MOCK_FACULTIES.find(f => f.id === facultyId);
  if (!faculty) return [];
  return MOCK_SUBJECTS.filter(s => faculty.subjects.includes(s.id));
};

// Helper function to get subjects by division
export const getSubjectsByDivision = (divisionId) => {
  const division = MOCK_DIVISIONS.find(d => d.id === divisionId);
  if (!division) return [];
  return MOCK_SUBJECTS.filter(s => division.subjects.includes(s.id));
};
