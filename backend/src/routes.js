import { Router } from 'express';
import { login, register } from './controllers.js';
import { authenticate, requireRole, checkSessionTimeout } from './middleware.js';

export const router = Router();

// Public routes (no authentication required)
router.post('/auth/register', register);
router.post('/auth/login', login);

// Apply authentication and session timeout check to all protected routes
router.use(authenticate); // Apply authentication to all routes below
router.use(checkSessionTimeout); // Apply session timeout check after authentication

// User routes - accessible by all authenticated users
router.get('/rooms', requireRole(['user', 'admin']), (req, res) => {
  // TODO: Implement room listing
});
router.post('/bookings', requireRole(['user', 'admin']), (req, res) => {
  // TODO: Implement booking creation
});
router.get('/bookings/my', requireRole(['user', 'admin']), (req, res) => {
  // TODO: Implement user's booking history
});

// Admin-only routes
router.get('/admin/users', requireRole(['admin']), (req, res) => {
  // TODO: Implement user management for admins
});
router.post('/admin/rooms', requireRole(['admin']), (req, res) => {
  // TODO: Implement room creation/management
});
router.get('/admin/bookings', requireRole(['admin']), (req, res) => {
  // TODO: Implement all bookings view for admins
});
router.get('/admin/reports', requireRole(['admin']), (req, res) => {
  // TODO: Implement admin reports
});
