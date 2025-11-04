import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { User } from './models.js';
import rateLimit from 'express-rate-limit';

export function checkSessionTimeout(req, res, next) {
  if (req.session && req.session.lastActivity) {
    const currentTime = Date.now();
    const lastActivity = new Date(req.session.lastActivity).getTime();
    const sessionTimeout = config.session.cookie.maxAge;

    if (currentTime - lastActivity > sessionTimeout) {
      return res.status(440).json({ message: 'Session expired' });
    }
  }

  // Update last activity time
  req.session.lastActivity = new Date();
  next();
}

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    next();
  };
}

// Rate limiting middleware for general API requests
export const generalRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for login attempts
export const loginRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.loginMaxRequests,
  message: { message: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});