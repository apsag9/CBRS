import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookingApi, RoomApi } from '../../api/api.js';

export default function BookingForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedRoomId = searchParams.get('roomId');

  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    roomId: preSelectedRoomId || '',
    startTime: '',
    endTime: '',
    purpose: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    try {
      const data = await RoomApi.getAll({ isActive: 'true' });
      setRooms(data.rooms);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    }
  }

  function handleChange(field, value) {
    setFormData(prev => {
      const updates = { [field]: value };
      
      // When start time changes, reset end time if it's now invalid
      if (field === 'startTime' && prev.endTime && new Date(value) >= new Date(prev.endTime)) {
        updates.endTime = '';
      }
      
      return { ...prev, ...updates };
    });
    setError(''); // Clear any existing error when form changes
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Client-side validation
    const now = new Date();
    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);

    if (startTime <= now) {
      setError('Start time must be in the future');
      return;
    }

    if (endTime <= startTime) {
      setError('End time must be after start time');
      return;
    }

    if (!formData.purpose?.trim()) {
      setError('Purpose is required');
      return;
    }

    setLoading(true);

    try {
      // Format dates as ISO strings for the API
      const bookingData = {
        ...formData,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      };

      await BookingApi.create(bookingData);
      alert('Booking created successfully!');
      navigate('/bookings/my');
    } catch (err) {
      const serverError = err.message?.includes('Failed to create booking:') 
        ? err.message.split(': ')[1]
        : 'Failed to create booking';
      setError(serverError);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h1>Create Booking</h1>

      <form onSubmit={handleSubmit} style={{ 
        display: 'grid', 
        gap: 16,
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'grid', gap: 4 }}>
          <label><strong>Room *</strong></label>
          <select
            value={formData.roomId}
            onChange={(e) => handleChange('roomId', e.target.value)}
            required
            style={{ padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
          >
            <option value="">Select a room</option>
            {rooms.map(room => (
              <option key={room._id} value={room._id}>
                {room.name} - {room.location} (Capacity: {room.capacity})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gap: 4 }}>
          <label><strong>Start Time *</strong></label>
          <input
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => handleChange('startTime', e.target.value)}
            required
            min={new Date().toISOString().slice(0, 16)}
            style={{ padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
          />
        </div>

        <div style={{ display: 'grid', gap: 4 }}>
          <label><strong>End Time *</strong></label>
          <input
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => handleChange('endTime', e.target.value)}
            required
            min={formData.startTime || new Date().toISOString().slice(0, 16)}
            style={{ padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
          />
        </div>

        <div style={{ display: 'grid', gap: 4 }}>
          <label><strong>Purpose *</strong></label>
          <textarea
            value={formData.purpose}
            onChange={(e) => handleChange('purpose', e.target.value)}
            placeholder="Enter the purpose of your booking"
            required
            rows={4}
            style={{ padding: 10, borderRadius: 4, border: '1px solid #ddd', fontFamily: 'inherit' }}
          />
        </div>

        {error && (
          <div style={{ 
            color: 'white', 
            backgroundColor: '#f44336',
            padding: 12,
            borderRadius: 4
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="submit"
            disabled={loading}
            style={{ 
              flex: 1,
              padding: 12,
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Creating...' : 'Create Booking'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/rooms')}
            style={{ 
              padding: 12,
              backgroundColor: '#757575',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}