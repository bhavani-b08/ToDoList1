// Task Service for API calls
// This project is a part of a hackathon run by https://www.katomaran.com

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export const taskService = {
  // Get all tasks with filters
  getTasks: async (params = {}) => {
    try {
      const response = await api.get('/api/tasks', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get single task
  getTask: async (id) => {
    try {
      const response = await api.get(`/api/tasks/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new task
  createTask: async (taskData) => {
    try {
      const response = await api.post('/api/tasks', taskData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update task
  updateTask: async (id, updates) => {
    try {
      const response = await api.put(`/api/tasks/${id}`, updates);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete task
  deleteTask: async (id) => {
    try {
      const response = await api.delete(`/api/tasks/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Share task
  shareTask: async (id, shareData) => {
    try {
      const response = await api.post(`/api/tasks/${id}/share`, shareData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Remove share
  removeShare: async (taskId, userId) => {
    try {
      const response = await api.delete(`/api/tasks/${taskId}/share/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default taskService;