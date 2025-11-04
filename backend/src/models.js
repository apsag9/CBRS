import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
  },
  { timestamps: true }
);

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    amenities: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    purpose: { type: String, required: true, trim: true },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected', 'cancelled'], 
      default: 'pending' 
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    cancellationReason: { type: String }
    ,
    lastReminderSentAt: { type: Date }
  },
  { timestamps: true }
);

// Indexes for better query performance
bookingSchema.index({ roomId: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ userId: 1, status: 1 });
roomSchema.index({ name: 1, location: 1 });

const activityLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, required: true }, // e.g. 'login', 'booking_create', 'booking_cancel', 'error'
    details: { type: Object, default: {} },
    ip: { type: String },
  },
  { timestamps: true }
);

activityLogSchema.index({ userId: 1, type: 1, createdAt: -1 });

// Validation: endTime must be after startTime
bookingSchema.pre('validate', function(next) {
  if (this.endTime <= this.startTime) {
    next(new Error('End time must be after start time'));
  }
  next();
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);
export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
export const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);