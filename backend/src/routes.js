import { Router } from 'express';
import { 
  login, 
  register, 
  getAllRooms, 
  getRoomById,
  createRoom, 
  updateRoom, 
  deleteRoom,
  createBooking,
  getUserBookings,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
  updateBooking,
  getAllUsers,
  getAdminReports
} from './controllers.js';
import { exportBookingsCsv, getRoomUtilization, getUserActivity, getActivityLogs } from './controllers.js';
import { 
  authenticate, 
  requireRole, 
  checkSessionTimeout,
  generalRateLimiter,
  loginRateLimiter
} from './middleware.js';

export const router = Router();

// 🧱 Apply general rate limiting
router.use(generalRateLimiter);

// ===== AUTH ROUTES =====
router.post('/auth/register', register);
router.post('/auth/login', loginRateLimiter, login);

// ===== AUTH MIDDLEWARE =====
router.use(authenticate);
router.use(checkSessionTimeout);

// ===== ROOM ROUTES =====
router.get('/rooms', requireRole(['user', 'admin']), getAllRooms);
router.get('/rooms/:id', requireRole(['user', 'admin']), getRoomById);

// ===== BOOKING ROUTES =====
router.post('/bookings', requireRole(['user', 'admin']), createBooking);
router.get('/bookings/my', requireRole(['user', 'admin']), getUserBookings);
router.patch('/bookings/:id/status', requireRole(['user', 'admin']), updateBookingStatus);
router.delete('/bookings/:id', requireRole(['user', 'admin']), deleteBooking);

// ===== ADMIN ROUTES =====
router.get('/admin/users', requireRole(['admin']), getAllUsers);
router.post('/admin/rooms', requireRole(['admin']), createRoom);
router.put('/admin/rooms/:id', requireRole(['admin']), updateRoom);
router.delete('/admin/rooms/:id', requireRole(['admin']), deleteRoom);
router.get('/admin/bookings', requireRole(['admin']), getAllBookings);
router.get('/admin/reports', requireRole(['admin']), getAdminReports);
router.get('/admin/reports/export', requireRole(['admin']), exportBookingsCsv);
router.get('/admin/reports/room-utilization', requireRole(['admin']), getRoomUtilization);
router.get('/admin/reports/user-activity', requireRole(['admin']), getUserActivity);
router.get('/admin/activity-logs', requireRole(['admin']), getActivityLogs);
// Allow booking updates (reschedule) by owner or admin
router.patch('/bookings/:id', requireRole(['user', 'admin']), updateBooking);
