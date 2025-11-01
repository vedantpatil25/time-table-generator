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
      if (a.type === SUBJECT_TYPES.LAB && b.type === SUBJECT_TYPES.THEORY)
        return -1;
      if (a.type === SUBJECT_TYPES.THEORY && b.type === SUBJECT_TYPES.LAB)
        return 1;
      return 0;
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
   * Find the best available slot for a lecture
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

    if (availableFaculties.length === 0) {
      console.warn(
        `No faculty available for subject ${requirement.subject.name}`
      );
      return null;
    }

    if (availableClassrooms.length === 0) {
      console.warn(
        `No classroom available for subject type ${requirement.type}`
      );
      return null;
    }

    if (requirement.duration > this.timeSlots.length) {
      console.warn(
        `Subject ${requirement.subject.name} requires ${requirement.duration} slots but only ${this.timeSlots.length} available`
      );
      return null;
    }

    // Try to find consecutive slots for multi-duration subjects
    for (const day of DAYS_OF_WEEK) {
      for (let i = 0; i <= this.timeSlots.length - requirement.duration; i++) {
        const slotsNeeded = [];
        let validSequence = true;

        // Check if we have enough consecutive slots
        for (let j = 0; j < requirement.duration; j++) {
          const slot = this.timeSlots[i + j];
          if (!slot || schedule[day][slot.id].occupied) {
            validSequence = false;
            break;
          }
          slotsNeeded.push(slot);
        }

        if (!validSequence) continue;

        // FIXED: Check for lunch breaks between consecutive slots
        if (requirement.duration > 1) {
          for (let j = 0; j < slotsNeeded.length - 1; j++) {
            const currentSlot = slotsNeeded[j];
            const nextSlot = slotsNeeded[j + 1];

            // Check if slots are truly consecutive (no gap)
            if (currentSlot.endTime !== nextSlot.startTime) {
              // There's a gap - check if it contains lunch
              const hasLunchInGap = this.allTimeSlots.some(
                (s) =>
                  s.isLunch &&
                  s.startTime >= currentSlot.endTime &&
                  s.endTime <= nextSlot.startTime
              );

              if (hasLunchInGap) {
                console.log(
                  `Skipping ${requirement.subject.name} - lunch break between ${currentSlot.endTime} and ${nextSlot.startTime}`
                );
                validSequence = false;
                break;
              }
            }
          }
        }

        if (!validSequence) continue;

        // Find available faculty for all these slots
        const faculty = availableFaculties.find((f) =>
          slotsNeeded.every((slot) =>
            this.isFacultyAvailable(f.id, day, slot.id, schedule)
          )
        );

        if (!faculty) continue;

        // Find available classroom for all these slots
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
    const requiredType =
      type === SUBJECT_TYPES.LAB ? CLASSROOM_TYPES.LAB : CLASSROOM_TYPES.THEORY;

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
