import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingApi, RoomApi, AuthApi } from '../../api/api.js';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRooms: 0,
    activeRooms: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    todayBookings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAdminAccess();
    loadDashboardData();
  }, []);

  function checkAdminAccess() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      alert('Access denied. Admin only.');
      navigate('/rooms');
    }
  }

  async function loadDashboardData() {
    try {
      setLoading(true);
      
      // Load rooms
      const roomsData = await RoomApi.getAll({});
      const rooms = roomsData.rooms || [];
      
      // Load all bookings
      const bookingsData = await BookingApi.getAll();
      const bookings = bookingsData.bookings || [];

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayBookings = bookings.filter(b => {
        const bookingDate = new Date(b.startTime);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === today.getTime();
      });

      setStats({
        totalRooms: rooms.length,
        activeRooms: rooms.filter(r => r.isActive).length,
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
        todayBookings: todayBookings.length
      });

      // Get recent bookings (last 5)
      const sorted = [...bookings].sort((a, b) => 
        new Date(b.createdAt || b.startTime) - new Date(a.createdAt || a.startTime)
      );
      setRecentBookings(sorted.slice(0, 5));
      
      setError('');
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusColor(status) {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'cancelled':
        return '#f44336';
      default:
        return '#757575';
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading dashboard...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>

      {error && (
        <div style={{
          color: 'white',
          backgroundColor: '#f44336',
          padding: 12,
          borderRadius: 4,
          marginBottom: 20
        }}>
          {error}
        </div>
      )}

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12,
        marginBottom: 30
      }}>
        <button
          onClick={() => navigate('/admin/rooms/manage')}
          style={{
            padding: 16,
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 'bold'
          }}
        >
          Manage Rooms
        </button>
        <button
          onClick={() => navigate('/admin/bookings')}
          style={{
            padding: 16,
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 'bold'
          }}
        >
          Manage Bookings
        </button>
        <button
          onClick={() => navigate('/admin/reports')}
          style={{
            padding: 16,
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 'bold'
          }}
        >
          View Reports
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 20,
        marginBottom: 30
      }}>
        <StatCard
          title="Total Rooms"
          value={stats.totalRooms}
          subtitle={`${stats.activeRooms} active`}
          color="#2196F3"
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          subtitle={`${stats.todayBookings} today`}
          color="#4CAF50"
        />
        <StatCard
          title="Pending"
          value={stats.pendingBookings}
          subtitle="Awaiting approval"
          color="#FF9800"
        />
        <StatCard
          title="Confirmed"
          value={stats.confirmedBookings}
          subtitle="Active bookings"
          color="#9C27B0"
        />
      </div>

      {/* Recent Bookings */}
      <div style={{
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16
        }}>
          <h2 style={{ margin: 0 }}>Recent Bookings</h2>
          <button
            onClick={() => navigate('/admin/bookings')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            View All
          </button>
        </div>

        {recentBookings.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: 20 }}>
            No bookings yet
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {recentBookings.map(booking => (
              <div
                key={booking._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 12,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/admin/bookings')}
              >
                <div>
                  <strong>{booking.roomId?.name || 'Room'}</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#666' }}>
                    {booking.userId?.email || 'User'} • {formatDateTime(booking.startTime)}
                  </p>
                </div>
                <span
                  style={{
                    padding: '4px 12px',
                    backgroundColor: getStatusColor(booking.status),
                    color: 'white',
                    borderRadius: 4,
                    fontSize: 12,
                    textTransform: 'capitalize'
                  }}
                >
                  {booking.status || 'pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, color }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`
    }}>
      <h3 style={{ margin: '0 0 8px 0', color: '#666', fontSize: 14 }}>
        {title}
      </h3>
      <div style={{ fontSize: 32, fontWeight: 'bold', color: color }}>
        {value}
      </div>
      <p style={{ margin: '8px 0 0 0', color: '#999', fontSize: 12 }}>
        {subtitle}
      </p>
    </div>
  );
}