// Task Filters Component for Sidebar
// This project is a part of a hackathon run by https://www.katomaran.com

import React from 'react';
import { Search, Filter, SortAsc, CheckCircle, Clock, AlertCircle, Flag } from 'lucide-react';

function TaskFilters({ filters, onFilterChange, stats }) {
  const handleSearchChange = (e) => {
    onFilterChange({ search: e.target.value });
  };

  const handleStatusChange = (status) => {
    onFilterChange({ status });
  };

  const handlePriorityChange = (priority) => {
    onFilterChange({ priority });
  };

  const handleSortChange = (sortBy) => {
    const sortOrder = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    onFilterChange({ sortBy, sortOrder });
  };

  const statusOptions = [
    { value: 'all', label: 'All Tasks', count: stats.total, icon: <Filter className="w-4 h-4" /> },
    { value: 'pending', label: 'Pending', count: stats.pending, icon: <Clock className="w-4 h-4" /> },
    { value: 'in-progress', label: 'In Progress', count: stats.inProgress, icon: <AlertCircle className="w-4 h-4" /> },
    { value: 'completed', label: 'Completed', count: stats.completed, icon: <CheckCircle className="w-4 h-4" /> }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  const sortOptions = [
    { value: 'dueDate', label: 'Due Date' },
    { value: 'createdAt', label: 'Created Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'title', label: 'Title' }
  ];

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Status</h3>
        <div className="space-y-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-all ${
                filters.status === option.value
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                {option.icon}
                <span>{option.label}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                filters.status === option.value
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {option.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Priority Filter */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Priority</h3>
        <div className="space-y-2">
          {priorityOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handlePriorityChange(option.value)}
              className={`w-full flex items-center space-x-2 p-2 rounded-lg text-sm transition-all ${
                filters.priority === option.value
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Flag className="w-4 h-4" />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Sort By</h3>
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-all ${
                filters.sortBy === option.value
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <SortAsc className="w-4 h-4" />
                <span>{option.label}</span>
              </div>
              {filters.sortBy === option.value && (
                <span className="text-xs">
                  {filters.sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <button
          onClick={() => onFilterChange({
            status: 'all',
            priority: 'all',
            search: '',
            sortBy: 'dueDate',
            sortOrder: 'asc'
          })}
          className="w-full text-sm text-gray-600 hover:text-blue-600 transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
}

export default TaskFilters;