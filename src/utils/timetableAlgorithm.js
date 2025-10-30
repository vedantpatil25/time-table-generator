// src/utils/timetableAlgorithm.js

import { DAYS_OF_WEEK, SUBJECT_TYPES, CLASSROOM_TYPES } from './constants.js';

/**
 * Timetable Generation Algorithm
 * Generates a conflict-free timetable for a division
 */
export class TimetableGenerator {
  constructor(data) {
    this.faculties = data.faculties;
    this.subjects = data.subjects;
    this.classrooms = data.classrooms;
    this.divisions = data.divisions;
    this.timeSlots = data.timeSlots.filter(slot => !slot.isLunch);
    this.conflicts = [];
  }

  /**
   * Generate timetable for a specific division
   * @param {string} divisionId - Division ID
   * @returns {Object} Generated timetable with entries and conflicts
   */
  generateTimetable(divisionId) {
    this.conflicts = [];
    const division = this.divisions.find(d => d.id === divisionId);
    
    if (!division) {
      throw new Error('Division not found');
    }

    // Get subjects for this division
    const divisionSubjects = this.subjects.filter(s => 
      division.subjects.includes(s.id)
    );

    // Create lecture requirements
    const lectureRequirements = this.createLectureRequirements(divisionSubjects);
    
    // Generate timetable entries
    const entries = this.scheduleLectures(division, lectureRequirements);

    return {
      id: `tt_${Date.now()}`,
      divisionId: divisionId,
      generatedBy: 'admin', // Will be set by calling component
      generatedAt: new Date().toISOString(),
      entries: entries,
      conflicts: this.conflicts
    };
  }

  /**
   * Create lecture requirements based on subjects
   * @param {Array} subjects - Array of subjects
   * @returns {Array} Array of lecture requirements
   */
  createLectureRequirements(subjects) {
    const requirements = [];
    
    subjects.forEach(subject => {
      for (let i = 0; i < subject.lecturesPerWeek; i++) {
        requirements.push({
          subjectId: subject.id,
          subject: subject,
          duration: subject.duration,
          type: subject.type,
          lectureNumber: i + 1
        });
      }
    });

    return requirements;
  }

  /**
   * Schedule lectures using a simple greedy algorithm
   * @param {Object} division - Division object
   * @param {Array} requirements - Lecture requirements
   * @returns {Array} Array of timetable entries
   */
  scheduleLectures(division, requirements) {
    const entries = [];
    const schedule = this.initializeSchedule();

    // Sort requirements by priority (labs first, then theory)
    requirements.sort((a, b) => {
      if (a.type === SUBJECT_TYPES.LAB && b.type === SUBJECT_TYPES.THEORY) return -1;
      if (a.type === SUBJECT_TYPES.THEORY && b.type === SUBJECT_TYPES.LAB) return 1;
      return 0;
    });

    requirements.forEach(req => {
      const slot = this.findBestSlot(req, schedule, division);
      if (slot) {
        const entry = this.createTimetableEntry(division.id, slot, req);
        entries.push(entry);
        this.markSlotAsOccupied(schedule, slot, req);
      } else {
        this.conflicts.push(`Could not schedule ${req.subject.name} lecture ${req.lectureNumber}`);
      }
    });

    return entries;
  }

  /**
   * Initialize empty schedule grid
   * @returns {Object} Empty schedule grid
   */
  initializeSchedule() {
    const schedule = {};
    DAYS_OF_WEEK.forEach(day => {
      schedule[day] = {};
      this.timeSlots.forEach(slot => {
        schedule[day][slot.id] = {
          faculty: null,
          classroom: null,
          subject: null
        };
      });
    });
    return schedule;
  }

  /**
   * Find the best available slot for a lecture
   * @param {Object} requirement - Lecture requirement
   * @param {Object} schedule - Current schedule
   * @param {Object} division - Division object
   * @returns {Object|null} Best slot or null if none found
   */
  findBestSlot(requirement, schedule, division) {
    const availableFaculties = this.getAvailableFaculties(requirement.subjectId);
    const availableClassrooms = this.getAvailableClassrooms(requirement.type);

    for (const day of DAYS_OF_WEEK) {
      for (const timeSlot of this.timeSlots) {
        // Check if slot is available
        if (schedule[day][timeSlot.id].faculty !== null) continue;

        // Find available faculty
        const faculty = availableFaculties.find(f => 
          this.isFacultyAvailable(f.id, day, timeSlot.id, schedule)
        );

        if (!faculty) continue;

        // Find available classroom
        const classroom = availableClassrooms.find(c => 
          this.isClassroomAvailable(c.id, day, timeSlot.id, schedule)
        );

        if (!classroom) continue;

        // Check if classroom capacity is sufficient
        if (classroom.capacity < division.studentCount) continue;

        return {
          day,
          timeSlot,
          faculty,
          classroom
        };
      }
    }

    return null;
  }

  /**
   * Get faculties who can teach a subject
   * @param {string} subjectId - Subject ID
   * @returns {Array} Array of available faculties
   */
  getAvailableFaculties(subjectId) {
    return this.faculties.filter(f => 
      f.subjects && f.subjects.includes(subjectId)
    );
  }

  /**
   * Get classrooms of specific type
   * @param {string} type - Classroom type (Theory/Lab)
   * @returns {Array} Array of available classrooms
   */
  getAvailableClassrooms(type) {
    const requiredType = type === SUBJECT_TYPES.LAB ? 
      CLASSROOM_TYPES.LAB : CLASSROOM_TYPES.THEORY;
    
    return this.classrooms.filter(c => c.type === requiredType);
  }

  /**
   * Check if faculty is available at given time
   * @param {string} facultyId - Faculty ID
   * @param {string} day - Day of week
   * @param {string} timeSlotId - Time slot ID
   * @param {Object} schedule - Current schedule
   * @returns {boolean} True if available
   */
  isFacultyAvailable(facultyId, day, timeSlotId, schedule) {
    // Check if faculty is already assigned at this time
    for (const checkDay of DAYS_OF_WEEK) {
      if (schedule[checkDay][timeSlotId]?.faculty?.id === facultyId) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if classroom is available at given time
   * @param {string} classroomId - Classroom ID
   * @param {string} day - Day of week
   * @param {string} timeSlotId - Time slot ID
   * @param {Object} schedule - Current schedule
   * @returns {boolean} True if available
   */
  isClassroomAvailable(classroomId, day, timeSlotId, schedule) {
    return schedule[day][timeSlotId].classroom?.id !== classroomId;
  }

  /**
   * Create a timetable entry
   * @param {string} divisionId - Division ID
   * @param {Object} slot - Selected slot
   * @param {Object} requirement - Lecture requirement
   * @returns {Object} Timetable entry
   */
  createTimetableEntry(divisionId, slot, requirement) {
    return {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      divisionId,
      day: slot.day,
      timeSlotId: slot.timeSlot.id,
      subjectId: requirement.subjectId,
      facultyId: slot.faculty.id,
      classroomId: slot.classroom.id,
      isLunch: false
    };
  }

  /**
   * Mark slot as occupied in schedule
   * @param {Object} schedule - Schedule grid
   * @param {Object} slot - Selected slot
   * @param {Object} requirement - Lecture requirement
   */
  markSlotAsOccupied(schedule, slot, requirement) {
    schedule[slot.day][slot.timeSlot.id] = {
      faculty: slot.faculty,
      classroom: slot.classroom,
      subject: requirement.subject
    };
  }
}

/**
 * Simple function to generate timetable
 * @param {Object} data - All app data
 * @param {string} divisionId - Division ID
 * @returns {Object} Generated timetable
 */
export const generateTimetableForDivision = (data, divisionId) => {
  const generator = new TimetableGenerator(data);
  return generator.generateTimetable(divisionId);
};