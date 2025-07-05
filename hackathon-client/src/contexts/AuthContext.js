// Authentication Context Provider with Google OAuth
// This project is a part of a hackathon run by https://www.katomaran.com

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer function
function authReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: null
      };
    
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
        error: null
      };
    
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    case ActionTypes.LOGOUT:
      return {
        ...initialState,
        loading: false
      };
    
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext();

// Auth Provider Component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check if user is authenticated
  const checkAuthStatus = async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      
      const response = await authService.getCurrentUser();
      
      if (response.status === 'success') {
        dispatch({ type: ActionTypes.SET_USER, payload: response.data.user });
      } else {
        dispatch({ type: ActionTypes.SET_USER, payload: null });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch({ type: ActionTypes.SET_USER, payload: null });
    }
  };

  // Login with Google
  const loginWithGoogle = () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      
      // Redirect to Google OAuth
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      window.location.href = `${apiUrl}/api/auth/google`;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      toast.error('Failed to initiate Google login');
    }
  };

  // Logout
  const logout = async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      
      await authService.logout();
      dispatch({ type: ActionTypes.LOGOUT });
      
      toast.success('Logged out successfully');
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      toast.error('Logout failed');
    }
  };

  // Update user preferences
  const updatePreferences = async (preferences) => {
    try {
      const response = await authService.updatePreferences(preferences);
      
      if (response.status === 'success') {
        dispatch({ 
          type: ActionTypes.SET_USER, 
          payload: {
            ...state.user,
            preferences: response.data.preferences
          }
        });
        toast.success('Preferences updated successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update preferences failed:', error);
      toast.error('Failed to update preferences');
      return false;
    }
  };

  // Delete account
  const deleteAccount = async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      
      await authService.deleteAccount();
      dispatch({ type: ActionTypes.LOGOUT });
      
      toast.success('Account deleted successfully');
      window.location.href = '/';
    } catch (error) {
      console.error('Delete account failed:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      toast.error('Failed to delete account');
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  };

  // Context value
  const value = {
    ...state,
    loginWithGoogle,
    logout,
    updatePreferences,
    deleteAccount,
    clearError,
    refreshAuth: checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default AuthContext;