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
    this.allTimeSlots = data.timeSlots || [];
    this.timeSlots = (data.timeSlots || []).filter((slot) => !slot.isLunch);
    this.conflicts = [];
  }

  /**
   * Generate timetable for a specific division
   */
  generateTimetable(divisionId) {
    this.conflicts = [];

    try {
      const division = this.divisions.find((d) => d.id === divisionId);
      if (!division) throw new Error("Division not found");

      const divisionSubjects = this.subjects.filter(
        (s) => division.subjects && division.subjects.includes(s.id)
      );
      if (divisionSubjects.length === 0) {
        throw new Error("No subjects assigned to this division");
      }

      const lectureRequirements =
        this.createLectureRequirements(divisionSubjects);
      const entries = this.scheduleLectures(division, lectureRequirements);

      return {
        id: `tt_${Date.now()}`,
        divisionId,
        generatedBy: "system",
        generatedAt: new Date().toISOString(),
        entries,
        conflicts: this.conflicts,
      };
    } catch (error) {
      console.error("Timetable generation error:", error);
      throw error;
    }
  }

  /**
   * Create lecture requirements based on subjects
   */
  createLectureRequirements(subjects) {
    const requirements = [];

    subjects.forEach((subject) => {
      const lecturesPerWeek = subject.lecturesPerWeek || 1;
      for (let i = 0; i < lecturesPerWeek; i++) {
        requirements.push({
          subjectId: subject.id,
          subject,
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
   */
  scheduleLectures(division, requirements) {
    const entries = [];
    const schedule = this.initializeSchedule();

    // Enhanced sorting with new priorities
    requirements.sort((a, b) => {
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

    const slotOrder = this.getPreferredSlotOrder(requirement.type);

    for (const day of DAYS_OF_WEEK) {
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
   */
  getPreferredSlotOrder(type) {
    const totalSlots = this.timeSlots.length;

    if (type === SUBJECT_TYPES.TECHNICAL_TRAINING) {
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
   */
  canScheduleOnDay(requirement, schedule, day) {
    const daySchedule = schedule[day];
    const typeCounts = {
      "Technical training": 0,
      Lab: 0,
      Theory: 0,
    };
    const labSubjects = new Set();
    let sameSubjectCount = 0;

    Object.values(daySchedule).forEach((slot) => {
      if (slot.occupied && slot.subject) {
        typeCounts[slot.subject.type] =
          (typeCounts[slot.subject.type] || 0) + 1;

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
   */
  isValidSubjectSpacing(requirement, day, slotsNeeded, schedule) {
    const daySchedule = schedule[day];
    const firstSlotIndex = this.timeSlots.findIndex(
      (slot) => slot.id === slotsNeeded[0].id
    );
    const lastSlotIndex = this.timeSlots.findIndex(
      (slot) => slot.id === slotsNeeded[slotsNeeded.length - 1].id
    );

    // Only check immediately adjacent slots (not with gaps)
    const checkAdjacent = (index) => {
      if (index < 0 || index >= this.timeSlots.length) return true;
      const slot = daySchedule[this.timeSlots[index].id];
      return !(slot.occupied && slot.subject?.id === requirement.subjectId);
    };

    // Only block if IMMEDIATELY adjacent (no gaps allowed)
    const prevBlocked =
      firstSlotIndex > 0 && !checkAdjacent(firstSlotIndex - 1);
    const nextBlocked =
      lastSlotIndex < this.timeSlots.length - 1 &&
      !checkAdjacent(lastSlotIndex + 1);

    return !prevBlocked && !nextBlocked;
  }

  /**
   * Get faculties who can teach a subject
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
   */
  isFacultyAvailable(facultyId, day, timeSlotId, schedule) {
    // FIXED: Only check the specific day and time slot
    const slot = schedule[day][timeSlotId];
    return !(slot && slot.faculty && slot.faculty.id === facultyId);
  }

  /**
   * Check if classroom is available at given time
   */
  isClassroomAvailable(classroomId, day, timeSlotId, schedule) {
    const slot = schedule[day][timeSlotId];
    return !(slot && slot.classroom && slot.classroom.id === classroomId);
  }

  /**
   * Create a timetable entry
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
