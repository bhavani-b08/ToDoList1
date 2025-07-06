// Task Detail Page
// This project is a part of a hackathon run by https://www.katomaran.com

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Share2, 
  Calendar, 
  Flag, 
  User, 
  Clock,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { taskService } from '../services/taskService';
import { useSocket } from '../contexts/SocketContext';
import TaskForm from '../components/TaskForm';
import LoadingSpinner from '../components/LoadingSpinner';

function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { joinTaskRoom, leaveTaskRoom } = useSocket();
  
  const [showEditForm, setShowEditForm] = useState(false);

  // Fetch task details
  const { data: taskResponse, isLoading, error } = useQuery(
    ['task', id],
    () => taskService.getTask(id),
    {
      enabled: !!id,
      retry: 1
    }
  );

  const task = taskResponse?.data?.task;

  // Join task room for real-time updates
  useEffect(() => {
    if (task?._id) {
      joinTaskRoom(task._id);
      return () => leaveTaskRoom(task._id);
    }
  }, [task?._id, joinTaskRoom, leaveTaskRoom]);

  // Update task mutation
  const updateTaskMutation = useMutation(
    (updates) => taskService.updateTask(id, updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['task', id]);
        queryClient.invalidateQueries(['tasks']);
        setShowEditForm(false);
        toast.success('Task updated successfully!');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update task');
      }
    }
  );

  // Delete task mutation
  const deleteTaskMutation = useMutation(
    () => taskService.deleteTask(id),
    {
      onSuccess: () => {
        toast.success('Task deleted successfully!');
        navigate('/dashboard');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete task');
      }
    }
  );

  const handleUpdateTask = (updates) => {
    updateTaskMutation.mutate(updates);
  };

  const handleToggleComplete = () => {
    handleUpdateTask({ completed: !task.completed });
  };

  const handleDeleteTask = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate();
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="large" text="Loading task details..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Task not found</h2>
          <p className="text-gray-600 mb-4">The task you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowEditForm(true)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              >
                <Edit3 className="w-5 h-5" />
              </button>
              <button
                onClick={handleDeleteTask}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                disabled={deleteTaskMutation.isLoading}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Task Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start space-x-4 flex-1">
                <button
                  onClick={handleToggleComplete}
                  className="mt-1 flex-shrink-0"
                  disabled={updateTaskMutation.isLoading}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400 hover:text-blue-600 transition-colors" />
                  )}
                </button>

                <div className="flex-1">
                  <h1 className={`text-3xl font-bold mb-4 ${
                    task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                  }`}>
                    {task.title}
                  </h1>

                  <div className="flex items-center space-x-4 mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                      <Flag className="w-4 h-4 mr-1" />
                      {task.priority} priority
                    </span>

                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className={`text-gray-600 leading-relaxed ${task.completed ? 'line-through' : ''}`}>
                  {task.description}
                </p>
              </div>
            )}

            {/* Meta Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Due Date */}
              {task.dueDate && (
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Due Date</p>
                    <p className="text-gray-600">
                      {format(new Date(task.dueDate), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
              )}

              {/* Created Date */}
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Created</p>
                  <p className="text-gray-600">
                    {format(new Date(task.createdAt), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
                  </p>
                </div>
              </div>

              {/* Last Updated */}
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Last Updated</p>
                  <p className="text-gray-600">
                    {format(new Date(task.updatedAt), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Shared Users */}
          {task.shareWith && task.shareWith.length > 0 && (
            <div className="p-8 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Share2 className="w-5 h-5 mr-2" />
                Shared With
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {task.shareWith.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-blue-800 font-medium">{email}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-8 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="text-sm text-gray-600">
                Task ID: {task._id}
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowEditForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Task</span>
                </button>
                
                <button
                  onClick={handleToggleComplete}
                  disabled={updateTaskMutation.isLoading}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                    task.completed
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {task.completed ? (
                    <>
                      <Circle className="w-4 h-4" />
                      <span>Mark Incomplete</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Complete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <TaskForm
          task={task}
          onSubmit={handleUpdateTask}
          onClose={() => setShowEditForm(false)}
          isLoading={updateTaskMutation.isLoading}
        />
      )}
    </div>
  );
}

export default TaskDetailPage;