export function validatePassword(password) {
  const minLength = 6;
  const errors = [];

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  // }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// src/utils/sanitizeInput.js
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  // Remove potential HTML or script tags
  return input
    .replace(/<[^>]*>?/gm, '')   // Strip HTML tags
    .replace(/[^\w\s@.-]/gi, '') // Remove dangerous symbols except @, ., -, _
    .trim();
}

// src/utils/validateEmail.js
export function validateEmail(email) {
  const errors = [];
  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
    return { isValid: false, errors };
  }

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    errors.push('Email is invalid');
  }

  return { isValid: errors.length === 0, errors };
}

export function validateBooking(bookingData) {
  const errors = [];

  if (!bookingData.roomId) {
    errors.push('Room is required');
  }

  if (!bookingData.startTime) {
    errors.push('Start time is required');
  }

  if (!bookingData.endTime) {
    errors.push('End time is required');
  }

  const startTime = new Date(bookingData.startTime);
  const endTime = new Date(bookingData.endTime);
  const now = new Date();

  if (isNaN(startTime.getTime())) {
    errors.push('Invalid start time');
  }

  if (isNaN(endTime.getTime())) {
    errors.push('Invalid end time');
  }

  if (startTime < now) {
    errors.push('Start time cannot be in the past');
  }

  if (endTime <= startTime) {
    errors.push('End time must be after start time');
  }

  if (!bookingData.purpose || typeof bookingData.purpose !== 'string' || bookingData.purpose.trim().length === 0) {
    errors.push('Booking purpose is required');
  }

  return { isValid: errors.length === 0, errors };
}

export function validateRoom(roomData) {
  const errors = [];

  if (!roomData.name || typeof roomData.name !== 'string' || roomData.name.trim().length === 0) {
    errors.push('Room name is required');
  }

  if (!roomData.location || typeof roomData.location !== 'string' || roomData.location.trim().length === 0) {
    errors.push('Room location is required');
  }

  if (!roomData.capacity || isNaN(roomData.capacity) || roomData.capacity < 1) {
    errors.push('Room capacity must be a positive number');
  }

  if (roomData.amenities && !Array.isArray(roomData.amenities)) {
    errors.push('Amenities must be an array');
  }

  return { isValid: errors.length === 0, errors };
}
