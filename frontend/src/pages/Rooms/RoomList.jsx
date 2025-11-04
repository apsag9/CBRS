import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoomApi } from '../../api/api.js';

export default function RoomList() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    minCapacity: '',
    maxCapacity: '',
  });

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    try {
      setLoading(true);
      const params = {};
      if (filters.location) params.location = filters.location;
      if (filters.minCapacity) params.minCapacity = filters.minCapacity;
      if (filters.maxCapacity) params.maxCapacity = filters.maxCapacity;
      
      const data = await RoomApi.getAll(params);
      setRooms(data.rooms);
      setError('');
    } catch (err) {
      setError('Failed to load rooms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }));
  }

  function applyFilters() {
    loadRooms();
  }

  function clearFilters() {
    setFilters({ location: '', minCapacity: '', maxCapacity: '' });
    setTimeout(loadRooms, 0);
  }

  if (loading) return <div style={{ padding: 20 }}>Loading rooms...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Available Rooms</h1>

      {/* Filters */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12,
        marginBottom: 20,
        padding: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 8
      }}>
        <input
          type="text"
          placeholder="Location"
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
          style={{ padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
        />
        <input
          type="number"
          placeholder="Min Capacity"
          value={filters.minCapacity}
          onChange={(e) => handleFilterChange('minCapacity', e.target.value)}
          style={{ padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
        />
        <input
          type="number"
          placeholder="Max Capacity"
          value={filters.maxCapacity}
          onChange={(e) => handleFilterChange('maxCapacity', e.target.value)}
          style={{ padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={applyFilters} style={{ 
            padding: 8, 
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}>
            Apply
          </button>
          <button onClick={clearFilters} style={{ 
            padding: 8, 
            backgroundColor: '#757575',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}>
            Clear
          </button>
        </div>
      </div>

      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}

      {/* Room Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 20
      }}>
        {rooms.map(room => (
          <div 
            key={room._id}
            style={{ 
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: 16,
              backgroundColor: 'white',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s'
            }}
            onClick={() => navigate(`/rooms/${room._id}`)}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <h3 style={{ margin: '0 0 8px 0' }}>{room.name}</h3>
            <p style={{ margin: '4px 0', color: '#666' }}>
              📍 {room.location}
            </p>
            <p style={{ margin: '4px 0', color: '#666' }}>
              👥 Capacity: {room.capacity}
            </p>
            {room.amenities && room.amenities.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <strong>Amenities:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                  {room.amenities.map((amenity, idx) => (
                    <span 
                      key={idx}
                      style={{ 
                        padding: '4px 8px',
                        backgroundColor: '#e3f2fd',
                        borderRadius: 4,
                        fontSize: 12
                      }}
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {rooms.length === 0 && !loading && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: 40 }}>
          No rooms found
        </p>
      )}
    </div>
  );
}