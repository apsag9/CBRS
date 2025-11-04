import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RoomApi } from '../../api/api.js';

export default function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRoom();
  }, [id]);

  async function loadRoom() {
    try {
      setLoading(true);
      const data = await RoomApi.getById(id);
      setRoom(data.room);
      setError('');
    } catch (err) {
      setError('Failed to load room details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;
  if (!room) return <div style={{ padding: 20 }}>Room not found</div>;

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/rooms')}
        style={{ 
          padding: '8px 16px',
          marginBottom: 20,
          backgroundColor: '#757575',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer'
        }}
      >
        ← Back to Rooms
      </button>

      <div style={{ 
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ marginTop: 0 }}>{room.name}</h1>
        
        <div style={{ display: 'grid', gap: 16, marginTop: 24 }}>
          <div>
            <strong>Location:</strong>
            <p style={{ margin: '4px 0' }}>📍 {room.location}</p>
          </div>

          <div>
            <strong>Capacity:</strong>
            <p style={{ margin: '4px 0' }}>👥 {room.capacity} people</p>
          </div>

          {room.amenities && room.amenities.length > 0 && (
            <div>
              <strong>Amenities:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {room.amenities.map((amenity, idx) => (
                  <span 
                    key={idx}
                    style={{ 
                      padding: '8px 12px',
                      backgroundColor: '#e3f2fd',
                      borderRadius: 4
                    }}
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <strong>Status:</strong>
            <p style={{ margin: '4px 0' }}>
              <span style={{ 
                padding: '4px 12px',
                backgroundColor: room.isActive ? '#4CAF50' : '#f44336',
                color: 'white',
                borderRadius: 4
              }}>
                {room.isActive ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/bookings/create?roomId=${room._id}`)}
          disabled={!room.isActive}
          style={{ 
            marginTop: 24,
            padding: '12px 24px',
            backgroundColor: room.isActive ? '#2196F3' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: room.isActive ? 'pointer' : 'not-allowed',
            fontSize: 16
          }}
        >
          Book This Room
        </button>
      </div>
    </div>
  );
}