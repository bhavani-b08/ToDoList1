// User Routes for User Search and Management
// This project is a part of a hackathon run by https://www.katomaran.com

const express = require('express');
const { query, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all user routes
router.use(authenticateToken);

// @route   GET /api/users/search
// @desc    Search users by name or email for task sharing
// @access  Private
router.get('/search', [
  query('q')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Search query must be between 2 and 50 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'validation_error',
        message: 'Invalid search query',
        errors: errors.array()
      });
    }

    const { q } = req.query;

    // Search users (excluding current user)
    const users = await User.searchUsers(q).find({
      _id: { $ne: req.userId }
    });

    res.json({
      status: 'success',
      data: {
        users: users.map(user => ({
          _id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture
        }))
      }
    });
  } catch (error) {
    console.error('❌ Search users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search users'
    });
  }
});

// @route   GET /api/users/profile/:id
// @desc    Get user profile (limited info for non-friends)
// @access  Private
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email profilePicture isActive');

    if (!user || !user.isActive) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture
        }
      }
    });
  } catch (error) {
    console.error('❌ Get user profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user profile'
    });
  }
});

module.exports = router;