import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import {
  Login,
  Register,
  RoomList,
  RoomDetails,
  BookingForm,
  BookingHistory,
  AdminDashboard,
  ManageRooms,
  ManageBookings,
  ReportsPage,
  NotFound
} from './pages.jsx';

function isAuthed() {
  return Boolean(localStorage.getItem('token'));
}

function isAdmin() {
  const user = localStorage.getItem('user');
  if (!user) return false;
  try {
    const userData = JSON.parse(user);
    return userData.role === 'admin';
  } catch {
    return false;
  }
}

function PrivateRoute({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/rooms" replace />;
  return children;
}

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  }

  if (!isAuthed()) {
    return (
      <nav style={{
        padding: '16px 20px',
        backgroundColor: '#2196F3',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontSize: 20, fontWeight: 'bold' }}>
          Confo Champs
        </Link>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" style={{
            color: 'white',
            textDecoration: 'none',
            padding: '8px 16px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 4
          }}>
            Login
          </Link>
          <Link to="/register" style={{
            color: 'white',
            textDecoration: 'none',
            padding: '8px 16px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 4
          }}>
            Register
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav style={{
      padding: '16px 20px',
      backgroundColor: '#2196F3',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <Link to={isAdmin() ? "/admin/dashboard" : "/rooms"} style={{
        color: 'white',
        textDecoration: 'none',
        fontSize: 20,
        fontWeight: 'bold'
      }}>
        Confo Champs
      </Link>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {isAdmin() ? (
          <>
            <Link to="/admin/dashboard" style={{ color: 'white', textDecoration: 'none' }}>
              Dashboard
            </Link>
            <Link to="/admin/rooms/manage" style={{ color: 'white', textDecoration: 'none' }}>
              Manage Rooms
            </Link>
            <Link to="/admin/bookings" style={{ color: 'white', textDecoration: 'none' }}>
              Manage Bookings
            </Link>
            <Link to="/admin/reports" style={{ color: 'white', textDecoration: 'none' }}>
              Reports
            </Link>
          </>
        ) : (
          <>
            <Link to="/rooms" style={{ color: 'white', textDecoration: 'none' }}>
              Rooms
            </Link>
            <Link to="/bookings/my" style={{ color: 'white', textDecoration: 'none' }}>
              My Bookings
            </Link>
            <Link to="/bookings/create" style={{ color: 'white', textDecoration: 'none' }}>
              New Booking
            </Link>
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 16 }}>
          <span style={{ fontSize: 14 }}>
            {user?.email} {isAdmin() && <span style={{ 
              backgroundColor: '#FF9800', 
              padding: '2px 8px', 
              borderRadius: 4,
              fontSize: 12,
              marginLeft: 4
            }}>Admin</span>}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Navbar />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected User Routes */}
        <Route path="/rooms" element={
          <PrivateRoute>
            <RoomList />
          </PrivateRoute>
        } />
        <Route path="/rooms/:id" element={
          <PrivateRoute>
            <RoomDetails />
          </PrivateRoute>
        } />
        <Route path="/bookings/create" element={
          <PrivateRoute>
            <BookingForm />
          </PrivateRoute>
        } />
        <Route path="/bookings/my" element={
          <PrivateRoute>
            <BookingHistory />
          </PrivateRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/rooms/manage" element={
          <AdminRoute>
            <ManageRooms />
          </AdminRoute>
        } />
        <Route path="/admin/bookings" element={
          <AdminRoute>
            <ManageBookings />
          </AdminRoute>
        } />
        <Route path="/admin/reports" element={
          <AdminRoute>
            <ReportsPage />
          </AdminRoute>
        } />

        {/* Root redirect */}
        <Route path="/" element={
          isAuthed() ? (
            isAdmin() ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/rooms" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}