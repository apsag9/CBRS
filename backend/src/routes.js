import { Router } from 'express';
import { login, register } from './controllers.js';
import { authenticate, requireRole } from './middleware.js';

export const router = Router();

// Public routes
router.post('/auth/register', register);
router.post('/auth/login', login);

// Protected routes - require authentication
router.use('/api', authenticate); // All routes under /api require authentication

// User routes - accessible by all authenticated users
router.get('/api/rooms', requireRole(['user', 'admin']), (req, res) => {
  // TODO: Implement room listing
});
router.post('/api/bookings', requireRole(['user', 'admin']), (req, res) => {
  // TODO: Implement booking creation
});
router.get('/api/bookings/my', requireRole(['user', 'admin']), (req, res) => {
  // TODO: Implement user's booking history
});

// Admin-only routes
router.get('/api/admin/users', requireRole(['admin']), (req, res) => {
  // TODO: Implement user management for admins
});
router.post('/api/admin/rooms', requireRole(['admin']), (req, res) => {
  // TODO: Implement room creation/management
});
router.get('/api/admin/bookings', requireRole(['admin']), (req, res) => {
  // TODO: Implement all bookings view for admins
});
router.get('/api/admin/reports', requireRole(['admin']), (req, res) => {
  // TODO: Implement admin reports
});
