import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { Booking } from './models.js';

export async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

export async function verifyPassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

export function generateJwtToken(payload, isRefreshToken = false) {
  return jwt.sign(
    payload, 
    config.jwtSecret, 
    { expiresIn: isRefreshToken ? '7d' : '2h' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return null;
  }
}

// Check if a room is available for the given time slot
export async function checkRoomAvailability(roomId, startTime, endTime, excludeBookingId = null) {
  const query = {
    roomId,
    status: { $in: ['pending', 'approved'] }, // Only consider pending or approved bookings
    $or: [
      // New booking starts during an existing booking
      { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
      // New booking ends during an existing booking
      { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
      // New booking completely contains an existing booking
      { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
    ]
  };

  // Exclude a specific booking (useful for updates)
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await Booking.findOne(query);
  return !conflictingBooking; // Returns true if available, false if conflict
}

// Get all bookings for a specific room within a date range
export async function getRoomBookings(roomId, startDate, endDate) {
  return Booking.find({
    roomId,
    status: { $in: ['pending', 'approved'] },
    startTime: { $lt: endDate },
    endTime: { $gt: startDate }
  })
  .populate('userId', 'email')
  .sort({ startTime: 1 });
}