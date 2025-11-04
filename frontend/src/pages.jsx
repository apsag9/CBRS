import React from 'react';

// Auth Pages
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';

// Room Pages
import RoomList from './pages/Rooms/RoomList.jsx';
import RoomDetails from './pages/Rooms/RoomDetails.jsx';

// Booking Pages
import BookingForm from './pages/Bookings/BookingForm.jsx';
import BookingHistory from './pages/Bookings/BookingHistory.jsx';

// Admin Pages
import AdminDashboard from './pages/Reports/AdminDashboard.jsx';
import ManageRooms from './pages/Rooms/ManageRooms.jsx';
import ManageBookings from './pages/Bookings/ManageBookings.jsx';
import ReportsPage from './pages/Reports/ReportsPage.jsx';

// Not Found
import NotFound from './pages/NotFound.jsx';

export {
  // Auth
  Login,
  Register,
  
  // Rooms
  RoomList,
  RoomDetails,
  
  // Bookings
  BookingForm,
  BookingHistory,
  
  // Admin
  AdminDashboard,
  ManageRooms,
  ManageBookings,
  ReportsPage,
  
  // Other
  NotFound
};