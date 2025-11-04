import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingApi } from '../../api/api.js';

export default function BookingHistory() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      const data = await BookingApi.getMyBookings();
      setBookings(data.bookings || []);
      setError('');
    } catch (err) {
      setError('Failed to load booking history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelBooking(bookingId) {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await BookingApi.cancel(bookingId);
      alert('Booking cancelled successfully');
      loadBookings(); // Reload bookings
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
      console.error(err);
    }
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

  function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function isUpcoming(startTime) {
    return new Date(startTime) > new Date();
  }

  function isPast(endTime) {
    return new Date(endTime) < new Date();
  }

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return isUpcoming(booking.startTime) && booking.status !== 'cancelled';
    if (filter === 'past') return isPast(booking.endTime);
    if (filter === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  if (loading) return <div style={{ padding: 20 }}>Loading booking history...</div>;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>My Booking History</h1>
        <button
          onClick={() => navigate('/bookings/create')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          + New Booking
        </button>
      </div>

      {/* Filter Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: 8, 
        marginBottom: 20,
        flexWrap: 'wrap'
      }}>
        {['all', 'upcoming', 'past', 'cancelled'].map(filterType => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            style={{
              padding: '8px 16px',
              backgroundColor: filter === filterType ? '#2196F3' : '#e0e0e0',
              color: filter === filterType ? 'white' : '#333',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {filterType}
          </button>
        ))}
      </div>

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

      {/* Bookings List */}
      <div style={{ display: 'grid', gap: 16 }}>
        {filteredBookings.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 40,
            backgroundColor: 'white',
            borderRadius: 8,
            color: '#666'
          }}>
            No bookings found
          </div>
        ) : (
          filteredBookings.map(booking => (
            <div
              key={booking._id}
              style={{
                backgroundColor: 'white',
                padding: 20,
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'grid',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0' }}>
                    {booking.roomId?.name || 'Room'}
                  </h3>
                  <p style={{ margin: '4px 0', color: '#666', fontSize: 14 }}>
                    📍 {booking.roomId?.location || 'Location not available'}
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

              <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
                <div>
                  <strong>Start:</strong> {formatDateTime(booking.startTime)}
                </div>
                <div>
                  <strong>End:</strong> {formatDateTime(booking.endTime)}
                </div>
                <div>
                  <strong>Purpose:</strong> {booking.purpose}
                </div>
              </div>

              {isUpcoming(booking.startTime) && booking.status !== 'cancelled' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => handleCancelBooking(booking._id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 14
                    }}
                  >
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}