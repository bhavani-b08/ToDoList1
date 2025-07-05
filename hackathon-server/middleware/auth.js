// Authentication Middleware
// This project is a part of a hackathon run by https://www.katomaran.com

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token and authenticate user
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies.token || 
                  (req.headers.authorization && req.headers.authorization.replace('Bearer ', ''));
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'katomaran-jwt-secret');
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. User not found or inactive.'
      });
    }
    
    // Add user to request object
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. Token expired.'
      });
    }
    
    console.error('❌ Authentication error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during authentication.'
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token || 
                  (req.headers.authorization && req.headers.authorization.replace('Bearer ', ''));
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'katomaran-jwt-secret');
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};