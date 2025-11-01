// src/utils/timetableAlgorithm.js

import { DAYS_OF_WEEK, SUBJECT_TYPES, CLASSROOM_TYPES } from "./constants.js";

/**
 * Timetable Generation Algorithm
 * Generates a conflict-free timetable for a division
 */
export class TimetableGenerator {
  constructor(data) {
    this.faculties = data.faculties || [];
    this.subjects = data.subjects || [];
    this.classrooms = data.classrooms || [];
    this.divisions = data.divisions || [];
    this.allTimeSlots = data.timeSlots || []; // Store all slots including lunch
    this.timeSlots = (data.timeSlots || []).filter((slot) => !slot.isLunch);
    this.conflicts = [];
  }

  /**
   * Generate timetable for a specific division
   * @param {string} divisionId - Division ID
   * @returns {Object} Generated timetable with entries and conflicts
   */
  generateTimetable(divisionId) {
    this.conflicts = [];

    try {
      const division = this.divisions.find((d) => d.id === divisionId);

      if (!division) {
        throw new Error("Division not found");
      }

      // Get subjects for this division
      const divisionSubjects = this.subjects.filter(
        (s) => division.subjects && division.subjects.includes(s.id)
      );

      if (divisionSubjects.length === 0) {
        throw new Error("No subjects assigned to this division");
      }

      // Create lecture requirements
      const lectureRequirements =
        this.createLectureRequirements(divisionSubjects);

      // Generate timetable entries
      const entries = this.scheduleLectures(division, lectureRequirements);

      return {
        id: `tt_${Date.now()}`,
        divisionId: divisionId,
        generatedBy: "system",
        generatedAt: new Date().toISOString(),
        entries: entries,
        conflicts: this.conflicts,
      };
    } catch (error) {
      console.error("Timetable generation error:", error);
      throw error;
    }
  }

  /**
   * Create lecture requirements based on subjects
   * @param {Array} subjects - Array of subjects
   * @returns {Array} Array of lecture requirements
   */
  createLectureRequirements(subjects) {
    const requirements = [];

    subjects.forEach((subject) => {
      const lecturesPerWeek = subject.lecturesPerWeek || 1;

      for (let i = 0; i < lecturesPerWeek; i++) {
        requirements.push({
          subjectId: subject.id,
          subject: subject,
          duration: subject.duration || 1,
          type: subject.type,
          lectureNumber: i + 1,
        });
      }
    });

    return requirements;
  }

  /**
   * Schedule lectures using enhanced algorithm with constraints
   * @param {Object} division - Division object
   * @param {Array} requirements - Lecture requirements
   * @returns {Array} Array of timetable entries
   */
  scheduleLectures(division, requirements) {
    const entries = [];
    const schedule = this.initializeSchedule();

    // Enhanced sorting with new priorities
    requirements.sort((a, b) => {
      // Priority: Technical Training > Lab > Theory
      const priority = {
        "Technical training": 0,
        Lab: 1,
        Theory: 2,
      };
      return priority[a.type] - priority[b.type];
    });

    requirements.forEach((req) => {
      const slot = this.findBestSlot(req, schedule, division);
      if (slot) {
        const entryArray = this.createTimetableEntry(division.id, slot, req);
        entries.push(...entryArray);
        this.markSlotAsOccupied(schedule, slot, req);
      } else {
        this.conflicts.push(
          `Could not schedule ${req.subject.name} lecture ${req.lectureNumber}`
        );
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

    DAYS_OF_WEEK.forEach((day) => {
      schedule[day] = {};
      this.timeSlots.forEach((slot) => {
        schedule[day][slot.id] = {
          faculty: null,
          classroom: null,
          subject: null,
          occupied: false,
        };
      });
    });

    return schedule;
  }

  /**
   * Find the best available slot with enhanced constraints
   * @param {Object} requirement - Lecture requirement
   * @param {Object} schedule - Current schedule
   * @param {Object} division - Division object
   * @returns {Object|null} Best slot or null if none found
   */
  findBestSlot(requirement, schedule, division) {
    const availableFaculties = this.getAvailableFaculties(
      requirement.subjectId
    );
    const availableClassrooms = this.getAvailableClassrooms(
      requirement.type,
      division.studentCount
    );

    if (availableFaculties.length === 0 || availableClassrooms.length === 0) {
      return null;
    }

    if (requirement.duration > this.timeSlots.length) {
      return null;
    }

    // Get preferred slot order based on subject type
    const slotOrder = this.getPreferredSlotOrder(requirement.type);

    for (const day of DAYS_OF_WEEK) {
      // Check day-level constraints first
      if (!this.canScheduleOnDay(requirement, schedule, day)) {
        continue;
      }

      for (const startSlotIndex of slotOrder) {
        if (startSlotIndex > this.timeSlots.length - requirement.duration)
          continue;

        const slotsNeeded = [];
        let validSequence = true;

        // Check consecutive slots
        for (let j = 0; j < requirement.duration; j++) {
          const slot = this.timeSlots[startSlotIndex + j];
          if (!slot || schedule[day][slot.id].occupied) {
            validSequence = false;
            break;
          }
          slotsNeeded.push(slot);
        }

        if (!validSequence) continue;

        // Check for lunch breaks
        if (requirement.duration > 1) {
          for (let j = 0; j < slotsNeeded.length - 1; j++) {
            const currentSlot = slotsNeeded[j];
            const nextSlot = slotsNeeded[j + 1];

            if (currentSlot.endTime !== nextSlot.startTime) {
              const hasLunchInGap = this.allTimeSlots.some(
                (s) =>
                  s.isLunch &&
                  s.startTime >= currentSlot.endTime &&
                  s.endTime <= nextSlot.startTime
              );

              if (hasLunchInGap) {
                validSequence = false;
                break;
              }
            }
          }
        }

        if (!validSequence) continue;

        // Check subject spacing constraint
        if (
          !this.isValidSubjectSpacing(requirement, day, slotsNeeded, schedule)
        ) {
          continue;
        }

        // Find available faculty and classroom
        const faculty = availableFaculties.find((f) =>
          slotsNeeded.every((slot) =>
            this.isFacultyAvailable(f.id, day, slot.id, schedule)
          )
        );

        if (!faculty) continue;

        const classroom = availableClassrooms.find((c) =>
          slotsNeeded.every((slot) =>
            this.isClassroomAvailable(c.id, day, slot.id, schedule)
          )
        );

        if (!classroom) continue;

        return {
          day,
          timeSlots: slotsNeeded,
          faculty,
          classroom,
        };
      }
    }

    return null;
  }

  /**
   * Get preferred slot order based on subject type
   * @param {string} type - Subject type
   * @returns {Array} Array of slot indices in preferred order
   */
  getPreferredSlotOrder(type) {
    const totalSlots = this.timeSlots.length;

    if (type === SUBJECT_TYPES.TECHNICAL_TRAINING) {
      // Technical training prefers slots 5-6 (indices 4-5), then others
      const preferred = [];

      // Add slots 5-6 first (indices 4-5)
      if (totalSlots > 4) preferred.push(4);
      if (totalSlots > 5) preferred.push(5);

      // Add remaining slots
      for (let i = 0; i < totalSlots; i++) {
        if (i !== 4 && i !== 5) {
          preferred.push(i);
        }
      }

      return preferred;
    }

    // For other types, normal order
    return Array.from({ length: totalSlots }, (_, i) => i);
  }

  /**
   * Check if a requirement can be scheduled on a specific day
   * @param {Object} requirement - Lecture requirement
   * @param {Object} schedule - Current schedule
   * @param {string} day - Day to check
   * @returns {boolean} True if can be scheduled
   */
  canScheduleOnDay(requirement, schedule, day) {
    const daySchedule = schedule[day];

    // Count existing lectures by type on this day
    const typeCounts = {
      "Technical training": 0,
      Lab: 0,
      Theory: 0,
    };

    // Count unique lab subjects on this day
    const labSubjects = new Set();

    // Count existing lectures of the same subject on this day
    let sameSubjectCount = 0;

    Object.values(daySchedule).forEach((slot) => {
      if (slot.occupied && slot.subject) {
        typeCounts[slot.subject.type] =
          (typeCounts[slot.subject.type] || 0) + 1;

        // Track unique lab subjects
        if (slot.subject.type === SUBJECT_TYPES.LAB) {
          labSubjects.add(slot.subject.id);
        }

        if (slot.subject.id === requirement.subjectId) {
          sameSubjectCount++;
        }
      }
    });

    // Apply constraints

    // 1. Maximum one technical training per day
    if (
      requirement.type === SUBJECT_TYPES.TECHNICAL_TRAINING &&
      typeCounts["Technical training"] >= 1
    ) {
      return false;
    }

    // 2. Maximum two lab SUBJECTS per day (not slots)
    if (requirement.type === SUBJECT_TYPES.LAB) {
      // If this is a new lab subject and we already have 2 lab subjects
      if (!labSubjects.has(requirement.subjectId) && labSubjects.size >= 2) {
        return false;
      }
    }

    // 3. Maximum two lectures of same subject per day
    if (sameSubjectCount >= 2) {
      return false;
    }

    return true;
  }

  /**
   * Check if subject spacing is valid (avoid consecutive lectures of same subject)
   * @param {Object} requirement - Lecture requirement
   * @param {string} day - Day to check
   * @param {Array} slotsNeeded - Slots being considered
   * @param {Object} schedule - Current schedule
   * @returns {boolean} True if spacing is valid
   */
  isValidSubjectSpacing(requirement, day, slotsNeeded, schedule) {
    const daySchedule = schedule[day];
    const firstSlotIndex = this.timeSlots.findIndex(
      (slot) => slot.id === slotsNeeded[0].id
    );
    const lastSlotIndex = this.timeSlots.findIndex(
      (slot) => slot.id === slotsNeeded[slotsNeeded.length - 1].id
    );

    // Check slot before first slot
    if (firstSlotIndex > 0) {
      const prevSlot = this.timeSlots[firstSlotIndex - 1];
      const prevSchedule = daySchedule[prevSlot.id];
      if (
        prevSchedule.occupied &&
        prevSchedule.subject &&
        prevSchedule.subject.id === requirement.subjectId
      ) {
        return false; // Same subject in previous slot
      }
    }

    // Check slot after last slot
    if (lastSlotIndex < this.timeSlots.length - 1) {
      const nextSlot = this.timeSlots[lastSlotIndex + 1];
      const nextSchedule = daySchedule[nextSlot.id];
      if (
        nextSchedule.occupied &&
        nextSchedule.subject &&
        nextSchedule.subject.id === requirement.subjectId
      ) {
        return false; // Same subject in next slot
      }
    }

    return true;
  }

  /**
   * Get faculties who can teach a subject
   * @param {string} subjectId - Subject ID
   * @returns {Array} Array of available faculties
   */
  getAvailableFaculties(subjectId) {
    return this.faculties.filter(
      (f) =>
        f.subjects &&
        Array.isArray(f.subjects) &&
        f.subjects.includes(subjectId)
    );
  }

  /**
   * Get classrooms of specific type with sufficient capacity
   * @param {string} type - Subject type (Theory/Lab)
   * @param {number} studentCount - Number of students
   * @returns {Array} Array of available classrooms
   */
  getAvailableClassrooms(type, studentCount) {
    let requiredType;

    switch (type) {
      case SUBJECT_TYPES.LAB:
        requiredType = CLASSROOM_TYPES.LAB;
        break;
      case SUBJECT_TYPES.TECHNICAL_TRAINING:
        requiredType = CLASSROOM_TYPES.TECHNICAL_TRAINING;
        break;
      case SUBJECT_TYPES.THEORY:
      default:
        requiredType = CLASSROOM_TYPES.THEORY;
        break;
    }

    return this.classrooms.filter(
      (c) => c.type === requiredType && c.capacity >= studentCount
    );
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
    // FIXED: Only check the specific day and time slot
    const slot = schedule[day][timeSlotId];
    return !(slot && slot.faculty && slot.faculty.id === facultyId);
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
    const slot = schedule[day][timeSlotId];
    return !(slot && slot.classroom && slot.classroom.id === classroomId);
  }

  /**
   * Create a timetable entry
   * @param {string} divisionId - Division ID
   * @param {Object} slot - Selected slot
   * @param {Object} requirement - Lecture requirement
   * @returns {Array} Array of timetable entries
   */
  createTimetableEntry(divisionId, slot, requirement) {
    const entries = [];
    const timeSlots = slot.timeSlots || [];

    timeSlots.forEach((timeSlot, index) => {
      entries.push({
        id: `entry_${divisionId}_${slot.day}_${
          timeSlot.id
        }_${index}_${Date.now()}`,
        divisionId,
        day: slot.day,
        timeSlotId: timeSlot.id,
        subjectId: requirement.subjectId,
        facultyId: slot.faculty.id,
        classroomId: slot.classroom.id,
        isLunch: false,
        isMultiSlot: timeSlots.length > 1,
        slotIndex: index,
      });
    });

    return entries;
  }

  /**
   * Mark slot as occupied in schedule
   * @param {Object} schedule - Schedule grid
   * @param {Object} slot - Selected slot
   * @param {Object} requirement - Lecture requirement
   */
  markSlotAsOccupied(schedule, slot, requirement) {
    const timeSlots = slot.timeSlots || [];

    timeSlots.forEach((timeSlot) => {
      schedule[slot.day][timeSlot.id] = {
        faculty: slot.faculty,
        classroom: slot.classroom,
        subject: requirement.subject,
        occupied: true,
      };
    });
  }
}

/**
 * Simple function to generate timetable
 * @param {Object} data - All app data
 * @param {string} divisionId - Division ID
 * @returns {Object} Generated timetable
 */
export const generateTimetableForDivision = (data, divisionId) => {
  try {
    const generator = new TimetableGenerator(data);
    return generator.generateTimetable(divisionId);
  } catch (error) {
    console.error("Error in generateTimetableForDivision:", error);
    throw error;
  }
};

/**
 * Validate timetable data before generation
 * @param {Object} data - All app data
 * @returns {Object} Validation result
 */
export const validateTimetableData = (data) => {
  const errors = [];

  if (!data.faculties || data.faculties.length === 0) {
    errors.push("No faculties available");
  }

  if (!data.subjects || data.subjects.length === 0) {
    errors.push("No subjects available");
  }

  if (!data.classrooms || data.classrooms.length === 0) {
    errors.push("No classrooms available");
  }

  if (!data.timeSlots || data.timeSlots.length === 0) {
    errors.push("No time slots available");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
