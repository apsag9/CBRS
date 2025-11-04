import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingApi, RoomApi, AdminApi } from '../../api/api.js';

export default function ReportsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    pendingBookings: 0,
    totalRooms: 0,
    activeRooms: 0,
    mostBookedRoom: null,
    bookingsByMonth: [],
    roomUtilization: []
  });

  useEffect(() => {
    checkAdminAccess();
    loadReportData();
  }, []);

  function checkAdminAccess() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      alert('Access denied. Admin only.');
      navigate('/rooms');
    }
  }

  async function loadReportData() {
    try {
      setLoading(true);

      // Load all bookings and rooms
      const [bookingsData, roomsData] = await Promise.all([
        BookingApi.getAll(),
        RoomApi.getAll({})
      ]);

      const bookings = bookingsData.bookings || [];
      const rooms = roomsData.rooms || [];

      // Calculate statistics
      const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
      const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
      const pendingBookings = bookings.filter(b => b.status === 'pending').length;

      // Find most booked room
      const roomBookingCounts = {};
      bookings.forEach(booking => {
        const roomId = booking.roomId?._id || booking.roomId;
        if (roomId) {
          roomBookingCounts[roomId] = (roomBookingCounts[roomId] || 0) + 1;
        }
      });

      const mostBookedRoomId = Object.keys(roomBookingCounts).reduce((a, b) => 
        roomBookingCounts[a] > roomBookingCounts[b] ? a : b
      , null);

      const mostBookedRoom = mostBookedRoomId 
        ? rooms.find(r => r._id === mostBookedRoomId)
        : null;

      // Calculate bookings by month (last 6 months)
      const monthlyData = calculateMonthlyBookings(bookings);

      // Calculate room utilization
      const utilization = rooms.map(room => {
        const roomId = room._id;
        const bookingCount = roomBookingCounts[roomId] || 0;
        return {
          roomName: room.name,
          bookings: bookingCount,
          utilizationRate: rooms.length > 0 ? ((bookingCount / bookings.length) * 100).toFixed(1) : 0
        };
      }).sort((a, b) => b.bookings - a.bookings);

      setReportData({
        totalBookings: bookings.length,
        confirmedBookings,
        cancelledBookings,
        pendingBookings,
        totalRooms: rooms.length,
        activeRooms: rooms.filter(r => r.isActive).length,
        mostBookedRoom: mostBookedRoom ? {
          name: mostBookedRoom.name,
          count: roomBookingCounts[mostBookedRoomId]
        } : null,
        bookingsByMonth: monthlyData,
        roomUtilization: utilization
      });

      setError('');
    } catch (err) {
      setError('Failed to load report data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function calculateMonthlyBookings(bookings) {
    const monthlyData = {};
    const months = [];
    const now = new Date();

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      months.push(monthKey);
      monthlyData[monthKey] = 0;
    }

    // Count bookings per month
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.startTime);
      const monthKey = bookingDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      if (monthlyData.hasOwnProperty(monthKey)) {
        monthlyData[monthKey]++;
      }
    });

    return months.map(month => ({
      month,
      bookings: monthlyData[month]
    }));
  }

  function exportReport() {
    // Try server-side CSV export first; fallback to local text export if it fails
    (async () => {
      try {
        const blob = await AdminApi.exportBookingsCsv();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookings-export-${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.warn('Server CSV export failed, falling back to local export', err);
        // fallback: simple local text export (existing behavior)
        const reportText = `CONFERENCE ROOM BOOKING SYSTEM - REPORT\nGenerated: ${new Date().toLocaleString()}\n\nSUMMARY\nTotal Bookings: ${reportData.totalBookings}\nConfirmed: ${reportData.confirmedBookings}\nPending: ${reportData.pendingBookings}\nCancelled: ${reportData.cancelledBookings}`;
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `booking-report-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    })();
  }

  if (loading) return <div style={{ padding: 20 }}>Loading reports...</div>;

  return (
    <div style={{ padding: 20 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
      }}>
        <h1>Reports & Analytics</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={exportReport}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            📥 Export Report
          </button>
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

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 20,
        marginBottom: 30
      }}>
        <ReportCard
          title="Total Bookings"
          value={reportData.totalBookings}
          color="#2196F3"
        />
        <ReportCard
          title="Confirmed Bookings"
          value={reportData.confirmedBookings}
          subtitle={`${((reportData.confirmedBookings / reportData.totalBookings) * 100 || 0).toFixed(1)}% of total`}
          color="#4CAF50"
        />
        <ReportCard
          title="Pending Approval"
          value={reportData.pendingBookings}
          color="#FF9800"
        />
        <ReportCard
          title="Active Rooms"
          value={`${reportData.activeRooms} / ${reportData.totalRooms}`}
          color="#9C27B0"
        />
      </div>

      {/* Most Booked Room */}
      {reportData.mostBookedRoom && (
        <div style={{
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: 20
        }}>
          <h2>Most Booked Room</h2>
          <p style={{ fontSize: 24, color: '#2196F3', margin: '8px 0' }}>
            {reportData.mostBookedRoom.name}
          </p>
          <p style={{ color: '#666' }}>
            {reportData.mostBookedRoom.count} bookings
          </p>
        </div>
      )}

      {/* Bookings by Month */}
      <div style={{
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: 20
      }}>
        <h2>Bookings Trend (Last 6 Months)</h2>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 12,
          height: 200,
          marginTop: 20
        }}>
          {reportData.bookingsByMonth.map((data, idx) => {
            const maxBookings = Math.max(...reportData.bookingsByMonth.map(d => d.bookings), 1);
            const height = (data.bookings / maxBookings) * 150;
            
            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 'bold' }}>
                  {data.bookings}
                </div>
                <div
                  style={{
                    width: '100%',
                    height: height || 5,
                    backgroundColor: '#2196F3',
                    borderRadius: 4,
                    transition: 'height 0.3s'
                  }}
                />
                <div style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
                  {data.month}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Room Utilization */}
      <div style={{
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2>Room Utilization</h2>
        <div style={{ marginTop: 20 }}>
          {reportData.roomUtilization.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: 20 }}>
              No utilization data available
            </p>
          ) : (
            reportData.roomUtilization.map((room, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: 16,
                  padding: 12,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 4
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 8
                }}>
                  <strong>{room.roomName}</strong>
                  <span>{room.bookings} bookings ({room.utilizationRate}%)</span>
                </div>
                <div style={{
                  width: '100%',
                  height: 8,
                  backgroundColor: '#e0e0e0',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}>
                  <div
                    style={{
                      width: `${room.utilizationRate}%`,
                      height: '100%',
                      backgroundColor: '#4CAF50',
                      transition: 'width 0.3s'
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, value, subtitle, color }) {
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
      {subtitle && (
        <p style={{ margin: '8px 0 0 0', color: '#999', fontSize: 12 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}