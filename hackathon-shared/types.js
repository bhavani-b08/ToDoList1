// Shared types and constants for the Todo App
// This project is a part of a hackathon run by https://www.katomaran.com

// Task status enum
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress', 
  COMPLETED: 'completed'
};

// Task priority enum
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// API response status
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  VALIDATION_ERROR: 'validation_error'
};

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// Validation rules
export const VALIDATION_RULES = {
  TASK_TITLE_MIN_LENGTH: 3,
  TASK_TITLE_MAX_LENGTH: 200,
  TASK_DESCRIPTION_MAX_LENGTH: 1000,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// Socket events
export const SOCKET_EVENTS = {
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated', 
  TASK_DELETED: 'task_deleted',
  TASK_SHARED: 'task_shared',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left'
};

// Rate limiting
export const RATE_LIMITS = {
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes  
    max: 5 // limit auth attempts
  },
  TASKS: {
    windowMs: 60 * 1000, // 1 minute
    max: 30 // limit task operations
  }
};