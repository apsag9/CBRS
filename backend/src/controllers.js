import { User, Room, Booking, ActivityLog } from './models.js';
import { sendBookingCreated, sendBookingStatusChange } from './notifications.js';
import {
  hashPassword,
  verifyPassword,
  generateJwtToken,
  checkRoomAvailability,
} from './services.js';
import {
  sanitizeInput,
  validateEmail,
  validatePassword,
  validateRoom,
  validateBooking,
} from './validators.js';

// Helper: record activity logs (non-blocking)
async function logActivity({ userId = null, type, details = {}, ip = null }) {
  try {
    await ActivityLog.create({ userId, type, details, ip });
  } catch (err) {
    // don't block main flow on logging errors
    console.warn('Activity log failed:', err.message);
  }
}

// ===== AUTH CONTROLLERS =====

export async function register(req, res) {
  try {
    let { email, password, role } = req.body;

    email = sanitizeInput(email);
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid)
      return res.status(400).json({ message: emailValidation.errors[0] });

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid)
      return res.status(400).json({ message: passwordValidation.errors.join(', ') });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: 'Email already registered' });

    // Role control - allow role from request
    let userRole = role === 'admin' ? 'admin' : 'user';
    
    const passwordHash = await hashPassword(password);
    const user = await User.create({ email, passwordHash, role: userRole });

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Registration failed' });
  }
}

export async function login(req, res) {
  try {
    let { email, password } = req.body;
    email = sanitizeInput(email);

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid)
      return res.status(400).json({ message: emailValidation.errors[0] });

    if (!password)
      return res.status(400).json({ message: 'Password is required' });

    const user = await User.findOne({ email });
    if (!user || !(await verifyPassword(password, user.passwordHash)))
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateJwtToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // log login activity
    logActivity({ userId: user._id, type: 'login', details: { email: user.email }, ip: req.ip });

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Login failed' });
  }
}

// ===== ROOM CONTROLLERS =====

export async function getAllRooms(req, res) {
  try {
    const { location, minCapacity, maxCapacity, isActive } = req.query;
    const filter = {};

    if (location)
      filter.location = { $regex: sanitizeInput(location), $options: 'i' };
    if (minCapacity)
      filter.capacity = { $gte: parseInt(minCapacity) };
    if (maxCapacity)
      filter.capacity = { ...filter.capacity, $lte: parseInt(maxCapacity) };
    if (isActive !== undefined)
      filter.isActive = isActive === 'true';

    const rooms = await Room.find(filter)
      .populate('createdBy', 'email')
      .sort({ name: 1 });

    return res.json({ count: rooms.length, rooms });
  } catch (err) {
    console.error('Get rooms error:', err);
    return res.status(500).json({ message: 'Failed to fetch rooms' });
  }
}

export async function getRoomById(req, res) {
  try {
    const room = await Room.findById(req.params.id).populate('createdBy', 'email');
    if (!room) return res.status(404).json({ message: 'Room not found' });

    return res.json({ room });
  } catch (err) {
    console.error('Get room error:', err);
    return res.status(500).json({ message: 'Failed to fetch room' });
  }
}

export async function createRoom(req, res) {
  try {
    let { name, location, capacity, amenities } = req.body;

    name = sanitizeInput(name);
    location = sanitizeInput(location);
    amenities = amenities?.map(a => sanitizeInput(a)) || [];

    const roomData = { name, location, capacity: parseInt(capacity), amenities };
    const validation = validateRoom(roomData);
    if (!validation.isValid)
      return res.status(400).json({ message: validation.errors.join(', ') });

    const room = await Room.create({ ...roomData, createdBy: req.user.id });

    return res.status(201).json({ message: 'Room created successfully', room });
  } catch (err) {
    console.error('Create room error:', err);
    return res.status(500).json({ message: 'Failed to create room' });
  }
}

export async function updateRoom(req, res) {
  try {
    const { id } = req.params;
    let { name, location, capacity, amenities, isActive } = req.body;

    if (name) name = sanitizeInput(name);
    if (location) location = sanitizeInput(location);
    if (amenities) amenities = amenities.map(a => sanitizeInput(a));

    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    Object.assign(room, {
      ...(name && { name }),
      ...(location && { location }),
      ...(capacity && { capacity: parseInt(capacity) }),
      ...(amenities && { amenities }),
      ...(isActive !== undefined && { isActive }),
    });

    await room.save();
    return res.json({ message: 'Room updated successfully', room });
  } catch (err) {
    console.error('Update room error:', err);
    return res.status(500).json({ message: 'Failed to update room' });
  }
}

export async function deleteRoom(req, res) {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const activeBookings = await Booking.countDocuments({
      roomId: id,
      status: { $in: ['pending', 'approved'] },
      endTime: { $gt: new Date() },
    });

    if (activeBookings > 0)
      return res.status(400).json({
        message: 'Cannot delete room with active or pending bookings',
      });

    await Room.findByIdAndDelete(id);
    return res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    console.error('Delete room error:', err);
    return res.status(500).json({ message: 'Failed to delete room' });
  }
}

// ===== BOOKING CONTROLLERS =====

export async function createBooking(req, res) {
  try {
    let { roomId, startTime, endTime, purpose } = req.body;
    purpose = sanitizeInput(purpose);

    const bookingData = { roomId, startTime, endTime, purpose };
    const validation = validateBooking(bookingData);
    if (!validation.isValid)
      return res.status(400).json({ message: validation.errors.join(', ') });

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (!room.isActive)
      return res.status(400).json({ message: 'Room is not available for booking' });

    const available = await checkRoomAvailability(
      roomId,
      new Date(startTime),
      new Date(endTime)
    );
    if (!available)
      return res.status(409).json({
        message: 'Room is not available for the selected time slot',
      });

    const booking = await Booking.create({
      userId: req.user.id,
      roomId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      purpose,
      status: 'pending',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'email')
      .populate('roomId', 'name location');

    // log booking creation
    logActivity({
      userId: req.user.id,
      type: 'booking_create',
      details: { bookingId: populatedBooking._id, roomId: populatedBooking.roomId?._id },
      ip: req.ip,
    });

    // send notification (non-blocking)
    sendBookingCreated(populatedBooking).catch(err => console.warn('notify create failed', err.message));

    return res.status(201).json({
      message: 'Booking created successfully',
      booking: populatedBooking,
    });
  } catch (err) {
    console.error('Create booking error:', err);
    return res.status(500).json({ message: 'Failed to create booking' });
  }
}

export async function updateBooking(req, res) {
  try {
    const { id } = req.params;
    const { startTime, endTime, purpose } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // permission: owner or admin
    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized to modify this booking' });

    // Only allow reschedule if booking not cancelled
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Cannot reschedule a cancelled booking' });

    const updates = {};
    if (purpose) updates.purpose = sanitizeInput(purpose);

    if (startTime || endTime) {
      const newStart = startTime ? new Date(startTime) : booking.startTime;
      const newEnd = endTime ? new Date(endTime) : booking.endTime;

      if (isNaN(newStart) || isNaN(newEnd)) return res.status(400).json({ message: 'Invalid start or end time' });
      if (newEnd <= newStart) return res.status(400).json({ message: 'End time must be after start time' });

      const available = await checkRoomAvailability(
        booking.roomId,
        newStart,
        newEnd,
        id // exclude current booking
      );
      if (!available) return res.status(409).json({ message: 'Room is not available for the selected time slot' });

      updates.startTime = newStart;
      updates.endTime = newEnd;
    }

    Object.assign(booking, updates);
    await booking.save();

    const updated = await Booking.findById(id)
      .populate('userId', 'email')
      .populate('roomId', 'name location');

    // log reschedule
    logActivity({ userId: req.user.id, type: 'booking_update', details: { bookingId: id }, ip: req.ip });

    // notify user about reschedule
    sendBookingStatusChange(updated, 'rescheduled').catch(err => console.warn('notify reschedule failed', err.message));

    return res.json({ message: 'Booking updated successfully', booking: updated });
  } catch (err) {
    console.error('Update booking error:', err);
    return res.status(500).json({ message: 'Failed to update booking' });
  }
}

// record booking create activity and other actions in post-save spots
// (we'll log earlier using the helper in the createBooking flow by calling logActivity after creation)

export async function getUserBookings(req, res) {
  try {
    const filter = { userId: req.user.id };
    if (req.query.status) filter.status = req.query.status;

    const bookings = await Booking.find(filter)
      .populate('roomId', 'name location capacity amenities')
      .sort({ startTime: -1 });

    return res.json({ count: bookings.length, bookings });
  } catch (err) {
    console.error('Get user bookings error:', err);
    return res.status(500).json({ message: 'Failed to fetch bookings' });
  }
}

export async function getAllBookings(req, res) {
  try {
    const { status, roomId, userId, startDate, endDate } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (roomId) filter.roomId = roomId;
    if (userId) filter.userId = userId;
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(filter)
      .populate('userId', 'email')
      .populate('roomId', 'name location')
      .populate('approvedBy', 'email')
      .sort({ startTime: -1 });

    return res.json({ count: bookings.length, bookings });
  } catch (err) {
    console.error('Get all bookings error:', err);
    return res.status(500).json({ message: 'Failed to fetch bookings' });
  }
}

export async function updateBookingStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    if (!['approved', 'rejected', 'cancelled'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Only allow: admins can modify any booking, users can only cancel their own
    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'You are not allowed to modify this booking. Only admins or the booking owner can cancel.' });
    }
    if (req.user.role !== 'admin' && status !== 'cancelled') {
      return res.status(403).json({ message: 'Only admins can approve or reject bookings. Users can only cancel their own bookings.' });
    }

    booking.status = status;
    if (status === 'approved' || status === 'rejected') {
      booking.approvedBy = req.user.id;
      booking.approvedAt = new Date();
    }

    if (status === 'cancelled' && cancellationReason)
      booking.cancellationReason = sanitizeInput(cancellationReason);

    await booking.save();
    const updated = await Booking.findById(id)
      .populate('userId', 'email')
      .populate('roomId', 'name location')
      .populate('approvedBy', 'email');

    // log booking status change
    logActivity({
      userId: req.user.id,
      type: 'booking_status_change',
      details: { bookingId: id, newStatus: status, cancellationReason },
      ip: req.ip,
    });

    // send notification (non-blocking)
    sendBookingStatusChange(updated, status).catch(err => console.warn('notify status change failed', err.message));

    return res.json({
      message: `Booking ${status} successfully`,
      booking: updated,
    });
  } catch (err) {
    console.error('Update booking status error:', err);
    return res.status(500).json({ message: 'Failed to update booking' });
  }
}

export async function deleteBooking(req, res) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized to delete this booking' });

    await Booking.findByIdAndDelete(req.params.id);

    // log booking deletion
    logActivity({
      userId: req.user.id,
      type: 'booking_delete',
      details: { bookingId: req.params.id },
      ip: req.ip,
    });
    return res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('Delete booking error:', err);
    return res.status(500).json({ message: 'Failed to delete booking' });
  }
}

// ===== ADMIN CONTROLLERS =====

export async function getAllUsers(req, res) {
  try {
    const users = await User.find({}, '-passwordHash').sort({ createdAt: -1 });
    return res.json({ count: users.length, users });
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
}

export async function getAdminReports(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const [totalUsers, totalRooms, totalBookings] = await Promise.all([
      User.countDocuments(),
      Room.countDocuments(),
      Booking.countDocuments(),
    ]);

    const bookingStats = await Booking.aggregate([
      ...(startDate || endDate ? [{ $match: { createdAt: dateFilter } }] : []),
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const popularRooms = await Booking.aggregate([
      ...(startDate || endDate ? [{ $match: { createdAt: dateFilter } }] : []),
      { $group: { _id: '$roomId', bookingCount: { $sum: 1 } } },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'rooms',
          localField: '_id',
          foreignField: '_id',
          as: 'roomInfo',
        },
      },
      { $unwind: '$roomInfo' },
    ]);

    const activeUsers = await Booking.distinct(
      'userId',
      startDate || endDate ? { createdAt: dateFilter } : {}
    );

    return res.json({
      totalUsers,
      totalRooms,
      totalBookings,
      activeUsersCount: activeUsers.length,
      bookingStats: bookingStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      popularRooms: popularRooms.map(r => ({
        room: r.roomInfo.name,
        location: r.roomInfo.location,
        bookingCount: r.bookingCount,
      })),
    });
  } catch (err) {
    console.error('Get admin reports error:', err);
    return res.status(500).json({ message: 'Failed to generate reports' });
  }
}

  // Export bookings as CSV for a given filter (admin only)
  export async function exportBookingsCsv(req, res) {
    try {
      const { status, roomId, userId, startDate, endDate } = req.query;
      const filter = {};
      if (status) filter.status = status;
      if (roomId) filter.roomId = roomId;
      if (userId) filter.userId = userId;
      if (startDate || endDate) {
        filter.startTime = {};
        if (startDate) filter.startTime.$gte = new Date(startDate);
        if (endDate) filter.startTime.$lte = new Date(endDate);
      }

      const bookings = await Booking.find(filter)
        .populate('userId', 'email')
        .populate('roomId', 'name location')
        .sort({ startTime: -1 })
        .lean();

      const header = ['BookingId', 'UserEmail', 'RoomName', 'RoomLocation', 'StartTime', 'EndTime', 'Status', 'Purpose', 'CreatedAt'];
      const rows = bookings.map(b => [
        b._id,
        b.userId?.email || '',
        b.roomId?.name || '',
        b.roomId?.location || '',
        b.startTime ? new Date(b.startTime).toISOString() : '',
        b.endTime ? new Date(b.endTime).toISOString() : '',
        b.status || '',
        (b.purpose || '').replace(/\r?\n|,/g, ' '),
        b.createdAt ? new Date(b.createdAt).toISOString() : ''
      ]);

      const csv = [header, ...rows].map(r => r.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="bookings-${Date.now()}.csv"`);
      return res.send(csv);
    } catch (err) {
      console.error('Export CSV error:', err);
      return res.status(500).json({ message: 'Failed to export CSV' });
    }
  }

  // Room utilization over last N days (default 30)
  export async function getRoomUtilization(req, res) {
    try {
      const days = parseInt(req.query.days || '30', 10);
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const agg = await Booking.aggregate([
        { $match: { startTime: { $gte: since }, status: { $in: ['approved', 'confirmed', 'pending'] } } },
        { $project: { roomId: 1, durationMinutes: { $divide: [ { $subtract: ['$endTime', '$startTime'] }, 1000 * 60 ] } } },
        { $group: { _id: '$roomId', bookedMinutes: { $sum: '$durationMinutes' } } },
        { $lookup: { from: 'rooms', localField: '_id', foreignField: '_id', as: 'room' } },
        { $unwind: { path: '$room', preserveNullAndEmptyArrays: true } },
        { $project: { roomId: '$_id', roomName: '$room.name', location: '$room.location', bookedMinutes: 1 } }
      ]);

      const totalWindowMinutes = days * 24 * 60;
      const result = agg.map(r => ({
        roomId: r.roomId,
        roomName: r.roomName,
        location: r.location,
        bookedMinutes: Math.round(r.bookedMinutes || 0),
        occupancyRatePct: ((r.bookedMinutes || 0) / totalWindowMinutes * 100).toFixed(2)
      }));

      return res.json({ days, result });
    } catch (err) {
      console.error('Room utilization error:', err);
      return res.status(500).json({ message: 'Failed to compute room utilization' });
    }
  }

  // User activity reports (counts, durations) over last N days
  export async function getUserActivity(req, res) {
    try {
      const days = parseInt(req.query.days || '30', 10);
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const agg = await Booking.aggregate([
        { $match: { startTime: { $gte: since } } },
        { $project: { userId: 1, durationMinutes: { $divide: [ { $subtract: ['$endTime', '$startTime'] }, 1000 * 60 ] }, hour: { $hour: '$startTime' } } },
        { $group: { _id: '$userId', bookingCount: { $sum: 1 }, totalMinutes: { $sum: '$durationMinutes' }, lastBookingAt: { $max: '$$ROOT.startTime' } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        { $project: { userId: '$_id', email: '$user.email', bookingCount: 1, totalMinutes: 1, lastBookingAt: 1 } },
        { $sort: { bookingCount: -1 } }
      ]);

      // Peak booking hours across all bookings in window
      const hoursAgg = await Booking.aggregate([
        { $match: { startTime: { $gte: since } } },
        { $project: { hour: { $hour: '$startTime' } } },
        { $group: { _id: '$hour', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      return res.json({ days, users: agg, peakHours: hoursAgg });
    } catch (err) {
      console.error('User activity error:', err);
      return res.status(500).json({ message: 'Failed to compute user activity' });
    }
  }

  // Get recent activity logs
  export async function getActivityLogs(req, res) {
    try {
      const limit = Math.min(parseInt(req.query.limit || '100', 10), 1000);
      const logs = await ActivityLog.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('userId', 'email')
        .lean();

      return res.json({ count: logs.length, logs });
    } catch (err) {
      console.error('Get activity logs error:', err);
      return res.status(500).json({ message: 'Failed to fetch activity logs' });
    }
  }
