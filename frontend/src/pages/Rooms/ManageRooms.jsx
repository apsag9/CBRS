import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoomApi } from '../../api/api.js';

export default function ManageRooms() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: '',
    amenities: '',
    isActive: true
  });

  useEffect(() => {
    checkAdminAccess();
    loadRooms();
  }, []);

  function checkAdminAccess() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      alert('Access denied. Admin only.');
      navigate('/rooms');
    }
  }

  async function loadRooms() {
    try {
      setLoading(true);
      const data = await RoomApi.getAll({});
      setRooms(data.rooms || []);
      setError('');
    } catch (err) {
      setError('Failed to load rooms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function openAddForm() {
    setEditingRoom(null);
    setFormData({
      name: '',
      location: '',
      capacity: '',
      amenities: '',
      isActive: true
    });
    setShowForm(true);
  }

  function openEditForm(room) {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      location: room.location,
      capacity: room.capacity,
      amenities: room.amenities ? room.amenities.join(', ') : '',
      isActive: room.isActive
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      const submitData = {
        name: formData.name,
        location: formData.location,
        capacity: parseInt(formData.capacity),
        amenities: formData.amenities
          .split(',')
          .map(a => a.trim())
          .filter(a => a),
        isActive: formData.isActive
      };

      if (editingRoom) {
        await RoomApi.update(editingRoom._id, submitData);
        alert('Room updated successfully!');
      } else {
        await RoomApi.create(submitData);
        alert('Room created successfully!');
      }

      setShowForm(false);
      loadRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
      console.error(err);
    }
  }

  async function handleDelete(roomId) {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      await RoomApi.delete(roomId);
      alert('Room deleted successfully!');
      loadRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete room');
      console.error(err);
    }
  }

  async function toggleRoomStatus(room) {
    try {
      await RoomApi.update(room._id, { isActive: !room.isActive });
      loadRooms();
    } catch (err) {
      alert('Failed to update room status');
      console.error(err);
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading rooms...</div>;

  return (
    <div style={{ padding: 20 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
      }}>
        <h1>Manage Rooms</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => navigate('/admin/dashboard')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#757575',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={openAddForm}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            + Add New Room
          </button>
        </div>
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

      {/* Room Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: 24,
            borderRadius: 8,
            maxWidth: 500,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2>{editingRoom ? 'Edit Room' : 'Add New Room'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gap: 4 }}>
                <label><strong>Room Name *</strong></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  style={{ padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ display: 'grid', gap: 4 }}>
                <label><strong>Location *</strong></label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  required
                  style={{ padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ display: 'grid', gap: 4 }}>
                <label><strong>Capacity *</strong></label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => handleChange('capacity', e.target.value)}
                  required
                  min="1"
                  style={{ padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ display: 'grid', gap: 4 }}>
                <label><strong>Amenities (comma-separated)</strong></label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => handleChange('amenities', e.target.value)}
                  placeholder="Projector, Whiteboard, WiFi"
                  style={{ padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  id="isActive"
                />
                <label htmlFor="isActive">Room is active</label>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: 12,
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                >
                  {editingRoom ? 'Update Room' : 'Create Room'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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
        </div>
      )}

      {/* Rooms Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'auto'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: 12, textAlign: 'left' }}>Name</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Location</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Capacity</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Amenities</th>
              <th style={{ padding: 12, textAlign: 'center' }}>Status</th>
              <th style={{ padding: 12, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                  No rooms found
                </td>
              </tr>
            ) : (
              rooms.map(room => (
                <tr key={room._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 12 }}>{room.name}</td>
                  <td style={{ padding: 12 }}>{room.location}</td>
                  <td style={{ padding: 12 }}>{room.capacity}</td>
                  <td style={{ padding: 12 }}>
                    {room.amenities?.join(', ') || 'None'}
                  </td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    <button
                      onClick={() => toggleRoomStatus(room)}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: room.isActive ? '#4CAF50' : '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                    >
                      {room.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <button
                        onClick={() => openEditForm(room)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: 12
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(room._id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: 12
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}