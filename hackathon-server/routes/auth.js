// Authentication Routes with Google OAuth
// This project is a part of a hackathon run by https://www.katomaran.com

const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findByGoogleId(profile.id);
    
    if (user) {
      // Update last login
      await user.updateLastLogin();
      return done(null, user);
    }
    
    // Create new user
    user = new User({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      profilePicture: profile.photos[0].value
    });
    
    await user.save();
    console.log('✅ New user created:', user.email);
    
    return done(null, user);
  } catch (error) {
    console.error('❌ OAuth error:', error);
    return done(error, null);
  }
}));

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Initialize passport middleware
router.use(passport.initialize());
router.use(passport.session());

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'katomaran-jwt-secret',
    { expiresIn: '7d' }
  );
};

// Helper function to set secure cookie
const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get('/google', (req, res, next) => {
  console.log('🔐 Initiating Google OAuth...');
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
});

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }),
  async (req, res) => {
    try {
      console.log('✅ Google OAuth callback successful');
      
      // Generate JWT token
      const token = generateToken(req.user._id);
      
      // Set secure cookie
      setTokenCookie(res, token);
      
      // Redirect to frontend dashboard
      res.redirect(`${process.env.FRONTEND_URL}/dashboard?auth=success`);
    } catch (error) {
      console.error('❌ OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_failed`);
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided'
      });
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'katomaran-jwt-secret');
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found or inactive'
      });
    }
    
    res.json({
      status: 'success',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('❌ Auth verification error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', (req, res) => {
  try {
    // Clear cookie
    res.clearCookie('token');
    
    // Destroy session if using sessions
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('❌ Session destroy error:', err);
        }
      });
    }
    
    console.log('✅ User logged out successfully');
    
    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Logout failed'
    });
  }
});

// @route   PUT /api/auth/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', [
  body('theme').optional().isIn(['light', 'dark', 'system']),
  body('notifications.email').optional().isBoolean(),
  body('notifications.browser').optional().isBoolean(),
  body('taskView').optional().isIn(['list', 'grid', 'calendar'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'validation_error',
        message: 'Invalid preferences data',
        errors: errors.array()
      });
    }
    
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'katomaran-jwt-secret');
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Update preferences
    if (req.body.theme) user.preferences.theme = req.body.theme;
    if (req.body.notifications) {
      user.preferences.notifications = { ...user.preferences.notifications, ...req.body.notifications };
    }
    if (req.body.taskView) user.preferences.taskView = req.body.taskView;
    
    await user.save();
    
    res.json({
      status: 'success',
      message: 'Preferences updated successfully',
      data: {
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('❌ Update preferences error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update preferences'
    });
  }
});

// @route   DELETE /api/auth/account
// @desc    Delete user account
// @access  Private
router.delete('/account', async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'katomaran-jwt-secret');
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Soft delete - mark as inactive
    user.isActive = false;
    await user.save();
    
    // Clear cookie
    res.clearCookie('token');
    
    console.log('✅ User account deleted:', user.email);
    
    res.json({
      status: 'success',
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete account error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete account'
    });
  }
});

module.exports = router;