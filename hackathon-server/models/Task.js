// Task Model for MongoDB
// This project is a part of a hackathon run by https://www.katomaran.com

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  status: {
    type: String,
    enum: {
      values: ['todo', 'in_progress', 'completed'],
      message: 'Status must be one of: todo, in_progress, completed'
    },
    default: 'todo'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Priority must be one of: low, medium, high'
    },
    default: 'medium'
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(value) {
        // Due date should be in the future (optional validation)
        return !value || value >= new Date();
      },
      message: 'Due date cannot be in the past'
    }
  },
  completedAt: {
    type: Date,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reminder: {
    enabled: {
      type: Boolean,
      default: false
    },
    datetime: Date,
    sent: {
      type: Boolean,
      default: false
    }
  },
  metrics: {
    views: {
      type: Number,
      default: 0
    },
    edits: {
      type: Number,
      default: 0
    },
    lastViewedAt: Date,
    lastEditedAt: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      delete ret.isDeleted;
      return ret;
    }
  }
});

// Compound indexes for better query performance
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ 'sharedWith.user': 1 });
taskSchema.index({ isDeleted: 1 });

// Text index for search functionality
taskSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text' 
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && this.status !== 'completed';
});

// Virtual for due today status
taskSchema.virtual('isDueToday').get(function() {
  if (!this.dueDate) return false;
  const today = new Date();
  const due = new Date(this.dueDate);
  return today.toDateString() === due.toDateString();
});

// Instance methods
taskSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  this.metrics.lastEditedAt = new Date();
  this.metrics.edits += 1;
  return this.save();
};

taskSchema.methods.addView = function() {
  this.metrics.views += 1;
  this.metrics.lastViewedAt = new Date();
  return this.save();
};

taskSchema.methods.shareWith = function(userId, permission = 'view') {
  // Check if already shared with this user
  const existingShare = this.sharedWith.find(share => 
    share.user.toString() === userId.toString()
  );
  
  if (existingShare) {
    existingShare.permission = permission;
    existingShare.sharedAt = new Date();
  } else {
    this.sharedWith.push({
      user: userId,
      permission,
      sharedAt: new Date()
    });
  }
  
  return this.save();
};

taskSchema.methods.removeShare = function(userId) {
  this.sharedWith = this.sharedWith.filter(share => 
    share.user.toString() !== userId.toString()
  );
  return this.save();
};

taskSchema.methods.canUserAccess = function(userId) {
  // Owner can always access
  if (this.userId.toString() === userId.toString()) {
    return { canAccess: true, permission: 'edit' };
  }
  
  // Check if shared with user
  const share = this.sharedWith.find(share => 
    share.user.toString() === userId.toString()
  );
  
  if (share) {
    return { canAccess: true, permission: share.permission };
  }
  
  return { canAccess: false, permission: null };
};

// Static methods
taskSchema.statics.getTasksForUser = function(userId, options = {}) {
  const {
    status,
    priority,
    dueDate,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search
  } = options;

  let query = {
    $or: [
      { userId: userId },
      { 'sharedWith.user': userId }
    ],
    isDeleted: false
  };

  // Apply filters
  if (status) query.status = status;
  if (priority) query.priority = priority;
  
  if (dueDate) {
    if (dueDate === 'today') {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.dueDate = {
        $gte: today.setHours(0, 0, 0, 0),
        $lt: tomorrow.setHours(0, 0, 0, 0)
      };
    } else if (dueDate === 'overdue') {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: 'completed' };
    }
  }

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  const sortObj = {};
  sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find(query)
    .populate('userId', 'name email profilePicture')
    .populate('sharedWith.user', 'name email profilePicture')
    .sort(sortObj)
    .skip((page - 1) * limit)
    .limit(limit);
};

taskSchema.statics.getTaskStats = function(userId) {
  return this.aggregate([
    {
      $match: {
        $or: [
          { userId: mongoose.Types.ObjectId(userId) },
          { 'sharedWith.user': mongoose.Types.ObjectId(userId) }
        ],
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Pre-save middleware
taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed') {
    this.completedAt = new Date();
  } else if (this.isModified('status') && this.status !== 'completed') {
    this.completedAt = null;
  }
  
  if (this.isModified() && !this.isNew) {
    this.metrics.lastEditedAt = new Date();
    this.metrics.edits += 1;
  }
  
  next();
});

module.exports = mongoose.model('Task', taskSchema);