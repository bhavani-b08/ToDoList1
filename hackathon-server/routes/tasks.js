// Task Routes with CRUD Operations and Real-time Updates
// This project is a part of a hackathon run by https://www.katomaran.com

const express = require('express');
const { body, validationResult, query } = require('express-validator');
const rateLimit = require('express-rate-limit');
const Task = require('../models/Task');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Rate limiting for task operations
const taskLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    status: 'error',
    message: 'Too many task operations, please try again later.'
  }
});

// Apply authentication to all task routes
router.use(authenticateToken);
router.use(taskLimiter);

// Helper function to emit real-time updates
const emitTaskUpdate = (req, event, data) => {
  const io = req.app.get('io');
  if (io) {
    // Emit to user's room
    io.to(`user-${req.userId}`).emit(event, data);
    
    // Emit to shared users if task has sharedWith
    if (data.task && data.task.sharedWith) {
      data.task.sharedWith.forEach(share => {
        io.to(`user-${share.user}`).emit(event, data);
      });
    }
  }
};

// @route   GET /api/tasks
// @desc    Get user's tasks with filtering and pagination
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['todo', 'in_progress', 'completed']),
  query('priority').optional().isIn(['low', 'medium', 'high']),
  query('dueDate').optional().isIn(['today', 'overdue']),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'dueDate', 'priority', 'title']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('search').optional().isLength({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'validation_error',
        message: 'Invalid query parameters',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 10,
      status,
      priority,
      dueDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    // Get tasks for user
    const tasks = await Task.getTasksForUser(req.userId, {
      status,
      priority,
      dueDate,
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      search
    });

    // Get total count for pagination
    let countQuery = {
      $or: [
        { userId: req.userId },
        { 'sharedWith.user': req.userId }
      ],
      isDeleted: false
    };

    if (status) countQuery.status = status;
    if (priority) countQuery.priority = priority;
    if (search) countQuery.$text = { $search: search };

    const totalTasks = await Task.countDocuments(countQuery);
    const totalPages = Math.ceil(totalTasks / limit);

    // Get task statistics
    const stats = await Task.getTaskStats(req.userId);
    const taskStats = {
      total: totalTasks,
      todo: stats.find(s => s._id === 'todo')?.count || 0,
      in_progress: stats.find(s => s._id === 'in_progress')?.count || 0,
      completed: stats.find(s => s._id === 'completed')?.count || 0
    };

    res.json({
      status: 'success',
      data: {
        tasks,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalTasks,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        stats: taskStats
      }
    });
  } catch (error) {
    console.error('❌ Get tasks error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch tasks'
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get specific task by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('userId', 'name email profilePicture')
      .populate('sharedWith.user', 'name email profilePicture');

    if (!task || task.isDeleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    // Check if user can access this task
    const access = task.canUserAccess(req.userId);
    if (!access.canAccess) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    // Add view if not the owner
    if (task.userId._id.toString() !== req.userId.toString()) {
      await task.addView();
    }

    res.json({
      status: 'success',
      data: {
        task,
        permission: access.permission
      }
    });
  } catch (error) {
    console.error('❌ Get task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch task'
    });
  }
});

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post('/', [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 tags allowed'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'validation_error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, priority, dueDate, tags } = req.body;

    // Validate due date is not in the past
    if (dueDate && new Date(dueDate) < new Date()) {
      return res.status(400).json({
        status: 'error',
        message: 'Due date cannot be in the past'
      });
    }

    const task = new Task({
      title,
      description,
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      tags: tags || [],
      userId: req.userId
    });

    await task.save();
    
    // Populate user data
    await task.populate('userId', 'name email profilePicture');

    console.log('✅ Task created:', task.title);

    // Emit real-time update
    emitTaskUpdate(req, 'task_created', { task });

    res.status(201).json({
      status: 'success',
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    console.error('❌ Create task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create task'
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'completed'])
    .withMessage('Status must be todo, in_progress, or completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 tags allowed')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'validation_error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task || task.isDeleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    // Check if user can edit this task
    const access = task.canUserAccess(req.userId);
    if (!access.canAccess || access.permission !== 'edit') {
      return res.status(403).json({
        status: 'error',
        message: 'Permission denied'
      });
    }

    const { title, description, status, priority, dueDate, tags } = req.body;

    // Validate due date is not in the past (only if changing)
    if (dueDate && new Date(dueDate) < new Date()) {
      return res.status(400).json({
        status: 'error',
        message: 'Due date cannot be in the past'
      });
    }

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (tags !== undefined) task.tags = tags;

    await task.save();
    await task.populate('userId', 'name email profilePicture');
    await task.populate('sharedWith.user', 'name email profilePicture');

    console.log('✅ Task updated:', task.title);

    // Emit real-time update
    emitTaskUpdate(req, 'task_updated', { task });

    res.json({
      status: 'success',
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    console.error('❌ Update task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update task'
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task || task.isDeleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    // Only owner can delete
    if (task.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Only task owner can delete'
      });
    }

    // Soft delete
    task.isDeleted = true;
    await task.save();

    console.log('✅ Task deleted:', task.title);

    // Emit real-time update
    emitTaskUpdate(req, 'task_deleted', { taskId: task._id });

    res.json({
      status: 'success',
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete task'
    });
  }
});

// @route   POST /api/tasks/:id/share
// @desc    Share task with other users
// @access  Private
router.post('/:id/share', [
  body('emails')
    .isArray({ min: 1 })
    .withMessage('At least one email is required'),
  body('emails.*')
    .isEmail()
    .withMessage('All emails must be valid'),
  body('permission')
    .optional()
    .isIn(['view', 'edit'])
    .withMessage('Permission must be view or edit')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'validation_error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task || task.isDeleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    // Only owner can share
    if (task.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Only task owner can share'
      });
    }

    const { emails, permission = 'view' } = req.body;

    // Find users by email
    const users = await User.find({ 
      email: { $in: emails.map(email => email.toLowerCase()) },
      isActive: true 
    });

    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No valid users found with provided emails'
      });
    }

    // Share with each user
    const sharedWith = [];
    for (const user of users) {
      await task.shareWith(user._id, permission);
      sharedWith.push(user._id);
    }

    await task.populate('sharedWith.user', 'name email profilePicture');

    console.log('✅ Task shared with', users.length, 'users');

    // Emit real-time update to shared users
    emitTaskUpdate(req, 'task_shared', { task, sharedWith });

    res.json({
      status: 'success',
      message: `Task shared with ${users.length} user(s)`,
      data: { 
        task,
        sharedUsers: users.map(u => ({ 
          _id: u._id, 
          name: u.name, 
          email: u.email 
        }))
      }
    });
  } catch (error) {
    console.error('❌ Share task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to share task'
    });
  }
});

// @route   DELETE /api/tasks/:id/share/:userId
// @desc    Remove user from shared task
// @access  Private
router.delete('/:id/share/:userId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task || task.isDeleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    // Only owner can remove shares
    if (task.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Only task owner can remove shares'
      });
    }

    await task.removeShare(req.params.userId);
    await task.populate('sharedWith.user', 'name email profilePicture');

    console.log('✅ Task share removed');

    // Emit real-time update
    emitTaskUpdate(req, 'task_updated', { task });

    res.json({
      status: 'success',
      message: 'User removed from task',
      data: { task }
    });
  } catch (error) {
    console.error('❌ Remove share error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove share'
    });
  }
});

module.exports = router;