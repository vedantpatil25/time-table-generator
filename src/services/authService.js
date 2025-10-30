// src/services/authService.js

import { STORAGE_KEYS, USER_ROLES, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants.js';
import { MOCK_USERS, getUserByCredentials } from '../data/mockData.js';

/**
 * Authentication Service
 * Handles user login, logout, and session management using localStorage
 */
class AuthService {
  constructor() {
    this.currentUser = this.getCurrentUser();
    this.initializeUsers();
  }

  /**
   * Initialize users in localStorage if not exists
   */
  initializeUsers() {
    const existingUsers = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!existingUsers) {
      // Store mock users for authentication (in real app, this would be server-side)
      localStorage.setItem('app_users', JSON.stringify(MOCK_USERS));
    }
  }

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Login result with user data or error
   */
  async login(email, password) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Validate input
      if (!email || !password) {
        throw new Error(ERROR_MESSAGES.REQUIRED_FIELD);
      }

      // Get user from mock data
      const user = getUserByCredentials(email.toLowerCase().trim(), password);

      if (!user) {
        throw new Error(ERROR_MESSAGES.LOGIN_FAILED);
      }

      // Create session user (exclude password)
      const sessionUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(user.role === USER_ROLES.FACULTY && {
          subjects: user.subjects,
          monitoringDivision: user.monitoringDivision
        }),
        ...(user.role === USER_ROLES.STUDENT && {
          divisionId: user.divisionId,
          rollNumber: user.rollNumber
        }),
        loginTime: new Date().toISOString()
      };

      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(sessionUser));
      this.currentUser = sessionUser;

      return {
        success: true,
        user: sessionUser,
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        user: null
      };
    }
  }

  /**
   * Logout current user
   * @returns {Promise<Object>} - Logout result
   */
  async logout() {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Clear user session
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      this.currentUser = null;

      return {
        success: true,
        message: 'Logged out successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get current logged-in user
   * @returns {Object|null} - Current user or null
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if user is logged in
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} - True if user has the role
   */
  hasRole(role) {
    return this.currentUser && this.currentUser.role === role;
  }

  /**
   * Check if user is admin
   * @returns {boolean} - True if user is admin
   */
  isAdmin() {
    return this.hasRole(USER_ROLES.ADMIN);
  }

  /**
   * Check if user is faculty
   * @returns {boolean} - True if user is faculty
   */
  isFaculty() {
    return this.hasRole(USER_ROLES.FACULTY);
  }

  /**
   * Check if user is student
   * @returns {boolean} - True if user is student
   */
  isStudent() {
    return this.hasRole(USER_ROLES.STUDENT);
  }

  /**
   * Check if faculty can access specific division
   * @param {string} divisionId - Division ID to check
   * @returns {boolean} - True if faculty can access division
   */
  canAccessDivision(divisionId) {
    if (this.isAdmin()) return true;
    if (this.isFaculty()) {
      return this.currentUser.monitoringDivision === divisionId;
    }
    if (this.isStudent()) {
      return this.currentUser.divisionId === divisionId;
    }
    return false;
  }

  /**
   * Get user permissions based on role
   * @returns {Object} - Object with permission flags
   */
  getPermissions() {
    if (!this.currentUser) {
      return {
        canManageFaculties: false,
        canManageSubjects: false,
        canManageClassrooms: false,
        canManageDivisions: false,
        canManageTimeSlots: false,
        canGenerateAnyTimetable: false,
        canGenerateOwnTimetable: false,
        canViewTimetable: false
      };
    }

    const role = this.currentUser.role;

    return {
      canManageFaculties: role === USER_ROLES.ADMIN,
      canManageSubjects: role === USER_ROLES.ADMIN,
      canManageClassrooms: role === USER_ROLES.ADMIN,
      canManageDivisions: role === USER_ROLES.ADMIN,
      canManageTimeSlots: role === USER_ROLES.ADMIN,
      canGenerateAnyTimetable: role === USER_ROLES.ADMIN,
      canGenerateOwnTimetable: role === USER_ROLES.FACULTY && this.currentUser.monitoringDivision,
      canViewTimetable: true // All roles can view timetables
    };
  }

  /**
   * Validate session and refresh if needed
   * @returns {boolean} - True if session is valid
   */
  validateSession() {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Check if session is expired (optional - 24 hours)
    const loginTime = new Date(user.loginTime);
    const now = new Date();
    const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      this.logout();
      return false;
    }

    this.currentUser = user;
    return true;
  }

  /**
   * Update current user data
   * @param {Object} userData - Updated user data
   * @returns {boolean} - True if update successful
   */
  updateCurrentUser(userData) {
    try {
      if (!this.currentUser) return false;

      const updatedUser = {
        ...this.currentUser,
        ...userData,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
      this.currentUser = updatedUser;
      return true;

    } catch (error) {
      console.error('Error updating current user:', error);
      return false;
    }
  }

  /**
   * Get user's dashboard route based on role
   * @returns {string} - Dashboard route path
   */
  getDashboardRoute() {
    if (!this.currentUser) return '/login';

    switch (this.currentUser.role) {
      case USER_ROLES.ADMIN:
        return '/admin/dashboard';
      case USER_ROLES.FACULTY:
        return '/faculty/dashboard';
      case USER_ROLES.STUDENT:
        return '/student/dashboard';
      default:
        return '/login';
    }
  }

  /**
   * Get available test credentials for demo
   * @returns {Array} - Array of test credentials
   */
  getTestCredentials() {
    return [
      {
        role: 'Admin',
        email: 'admin@college.edu',
        password: 'admin123'
      },
      {
        role: 'Faculty (Monitor)',
        email: 'rajesh.kumar@college.edu',
        password: 'faculty123'
      },
      {
        role: 'Faculty (Non-Monitor)',
        email: 'vikram.singh@college.edu',
        password: 'faculty123'
      },
      {
        role: 'Student',
        email: 'arjun.mehta@student.edu',
        password: 'student123'
      }
    ];
  }
}

// Create singleton instance
const authService = new AuthService();

// Export both the class and instance
export { AuthService };
export default authService;

// Export commonly used functions for convenience
export const {
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  hasRole,
  isAdmin,
  isFaculty,
  isStudent,
  canAccessDivision,
  getPermissions,
  validateSession,
  getDashboardRoute,
  getTestCredentials
} = authService;
