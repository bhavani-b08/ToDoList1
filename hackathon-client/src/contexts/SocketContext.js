// Socket Context for Real-time Updates
// This project is a part of a hackathon run by https://www.katomaran.com

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const socketUrl = process.env.REACT_APP_WS_URL || process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const newSocket = io(socketUrl, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
        
        // Join user's room for personal notifications
        newSocket.emit('join_user_room', user._id);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      // Task-related events
      newSocket.on('task_created', (data) => {
        console.log('New task created:', data);
        
        // Invalidate tasks query to fetch latest data
        queryClient.invalidateQueries(['tasks']);
        
        // Show notification if task was shared with user
        if (data.task.shareWith && data.task.shareWith.includes(user.email)) {
          toast.success(`New task shared with you: ${data.task.title}`);
        }
      });

      newSocket.on('task_updated', (data) => {
        console.log('Task updated:', data);
        
        // Invalidate tasks query
        queryClient.invalidateQueries(['tasks']);
        
        // Show notification for shared tasks
        if (data.task.shareWith && data.task.shareWith.includes(user.email)) {
          toast.info(`Task updated: ${data.task.title}`);
        }
      });

      newSocket.on('task_deleted', (data) => {
        console.log('Task deleted:', data);
        
        // Invalidate tasks query
        queryClient.invalidateQueries(['tasks']);
        
        toast.info('A shared task was deleted');
      });

      newSocket.on('task_shared', (data) => {
        console.log('Task shared:', data);
        
        // Invalidate tasks query
        queryClient.invalidateQueries(['tasks']);
        
        if (data.sharedWith.includes(user.email)) {
          toast.success(`New task shared with you: ${data.task.title}`);
        }
      });

      // User activity events
      newSocket.on('user_activity', (data) => {
        console.log('User activity:', data);
        // Handle user activity notifications
      });

      // Error events
      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error('Connection error occurred');
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
        setSocket(null);
        setConnected(false);
      };
    } else {
      // Clean up socket when user logs out
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [isAuthenticated, user, queryClient]);

  // Socket methods
  const emitTaskUpdate = (taskData) => {
    if (socket && connected) {
      socket.emit('task_update', taskData);
    }
  };

  const emitTaskCreate = (taskData) => {
    if (socket && connected) {
      socket.emit('task_create', taskData);
    }
  };

  const emitTaskDelete = (taskId) => {
    if (socket && connected) {
      socket.emit('task_delete', { taskId });
    }
  };

  const emitTaskShare = (taskId, shareData) => {
    if (socket && connected) {
      socket.emit('task_share', { taskId, ...shareData });
    }
  };

  const joinTaskRoom = (taskId) => {
    if (socket && connected) {
      socket.emit('join_task_room', taskId);
    }
  };

  const leaveTaskRoom = (taskId) => {
    if (socket && connected) {
      socket.emit('leave_task_room', taskId);
    }
  };

  const value = {
    socket,
    connected,
    emitTaskUpdate,
    emitTaskCreate,
    emitTaskDelete,
    emitTaskShare,
    joinTaskRoom,
    leaveTaskRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  return context;
}

export default SocketContext;