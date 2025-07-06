// Task List Component with Real-time Updates
// This project is a part of a hackathon run by https://www.katomaran.com

import React from 'react';
import { 
  Calendar, 
  Clock, 
  Edit3, 
  Trash2, 
  Share2, 
  CheckCircle2, 
  Circle,
  AlertCircle,
  Flag,
  User
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

function TaskList({ tasks, onEdit, onDelete, onToggleComplete, isLoading }) {
  // Priority colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Format due date
  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    const now = new Date();
    
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isPast(date)) return `Overdue - ${format(date, 'MMM d')}`;
    
    return format(date, 'MMM d, yyyy');
  };

  // Get due date styling
  const getDueDateStyle = (dueDate, completed) => {
    if (!dueDate || completed) return 'text-gray-500';
    
    const date = new Date(dueDate);
    if (isPast(date)) return 'text-red-600 font-medium';
    if (isToday(date)) return 'text-orange-600 font-medium';
    
    return 'text-gray-600';
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
        <p className="text-gray-600 mb-6">
          Get started by creating your first task or adjust your filters.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task._id}
          className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all ${
            task.completed ? 'opacity-75' : ''
          } ${isLoading ? 'pointer-events-none' : ''}`}
        >
          <div className="flex items-start justify-between">
            {/* Left Section */}
            <div className="flex items-start space-x-4 flex-1">
              {/* Completion Toggle */}
              <button
                onClick={() => onToggleComplete(task)}
                className="mt-1 flex-shrink-0"
                disabled={isLoading}
              >
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400 hover:text-blue-600 transition-colors" />
                )}
              </button>

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className={`text-lg font-semibold ${
                    task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                  }`}>
                    {task.title}
                  </h3>
                  
                  {/* Priority Badge */}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    <Flag className="w-3 h-3 mr-1" />
                    {task.priority}
                  </span>

                  {/* Status Badge */}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>

                {/* Description */}
                {task.description && (
                  <p className={`text-gray-600 mb-3 ${task.completed ? 'line-through' : ''}`}>
                    {task.description}
                  </p>
                )}

                {/* Meta Information */}
                <div className="flex items-center space-x-6 text-sm">
                  {/* Due Date */}
                  {task.dueDate && (
                    <div className={`flex items-center space-x-1 ${getDueDateStyle(task.dueDate, task.completed)}`}>
                      <Calendar className="w-4 h-4" />
                      <span>{formatDueDate(task.dueDate)}</span>
                      {isPast(new Date(task.dueDate)) && !task.completed && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  )}

                  {/* Created Date */}
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Created {format(new Date(task.createdAt), 'MMM d')}</span>
                  </div>

                  {/* Shared Indicator */}
                  {task.shareWith && task.shareWith.length > 0 && (
                    <div className="flex items-center space-x-1 text-blue-600">
                      <User className="w-4 h-4" />
                      <span>Shared with {task.shareWith.length}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={() => onEdit(task)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                disabled={isLoading}
                title="Edit task"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => {/* TODO: Implement share functionality */}}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                disabled={isLoading}
                title="Share task"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDelete(task._id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                disabled={isLoading}
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Shared Users */}
          {task.shareWith && task.shareWith.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <Share2 className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Shared with:</span>
                <div className="flex items-center space-x-2">
                  {task.shareWith.slice(0, 3).map((email, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {email}
                    </span>
                  ))}
                  {task.shareWith.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{task.shareWith.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Updating task...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskList;