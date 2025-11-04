// frontend/src/pages/Bookings/ManageBookings.jsx
import React, { useState, useEffect } from 'react';
import { BookingApi } from '../../api/api.js';
import './ManageBookings.css';

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await BookingApi.getAll();
        setBookings(res.bookings || []);
        setError('');
      } catch (err) {
        setError('Failed to load bookings: ' + (err.message || 'Unknown'));
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [refreshKey]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await BookingApi.updateStatus(bookingId, { status: newStatus });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError('Failed to update booking status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      approved: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredBookingsRaw = bookings
    .filter((b) => (statusFilter === 'all' ? true : b.status === statusFilter))
    .filter((b) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const room = (b.roomId?.name || '').toLowerCase();
      const user = (b.userId?.email || '').toLowerCase();
      return room.includes(q) || user.includes(q);
    });

  const totalPages = Math.max(1, Math.ceil(filteredBookingsRaw.length / pageSize));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const filteredBookings = filteredBookingsRaw.slice((pageSafe - 1) * pageSize, (pageSafe - 1) * pageSize + pageSize);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="shimmer-loader w-64 h-12 rounded-lg"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-8 animate-fadeInDown">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-blue-900 tracking-tight">Manage Bookings</h2>
            <p className="text-gray-500 mt-2">Review and manage room booking requests</p>
          </div>
          <div className="flex w-full md:w-auto gap-4 items-center">
            <input value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} placeholder="Search room or user" className="w-full md:w-72 bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition" />
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="bg-white border border-gray-300 rounded-xl px-5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredBookingsRaw.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center border border-gray-100">
            <p className="mt-4 text-gray-400 text-lg">No {statusFilter} bookings found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl shadow-lg border border-gray-100">
            <div className="overflow-x-auto hidden md:block">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-blue-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Start</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">End</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-blue-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{b.roomId?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{b.userId?.email || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{new Date(b.startTime).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{new Date(b.endTime).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={"inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border badge-animate " + getStatusColor(b.status)}>
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {b.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button onClick={() => handleStatusChange(b._id, 'approved')} className="px-4 py-2 text-sm font-bold rounded-lg text-white bg-green-600 hover:bg-green-700 shadow transition">Approve</button>
                            <button onClick={() => handleStatusChange(b._id, 'rejected')} className="px-4 py-2 text-sm font-bold rounded-lg text-white bg-red-600 hover:bg-red-700 shadow transition">Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* mobile */}
            <div className="md:hidden space-y-6 p-4">
              {filteredBookings.map((b) => (
                <div key={b._id} className="bg-white border border-blue-100 rounded-xl p-5 shadow-md animate-fadeInDown">
                  <div className="flex justify-between mb-2">
                    <div>
                      <div className="text-base font-bold text-blue-900">{b.roomId?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{b.userId?.email || 'Unknown'}</div>
                    </div>
                    <div className="text-sm text-right">
                      <div className="font-semibold text-blue-700">{new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-xs text-gray-400">{new Date(b.startTime).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={"inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold border badge-animate " + getStatusColor(b.status)}>{b.status.charAt(0).toUpperCase() + b.status.slice(1)}</span>
                    {b.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleStatusChange(b._id, 'approved')} className="px-3 py-1 text-sm rounded-lg bg-green-600 text-white font-bold shadow hover:bg-green-700 transition">Approve</button>
                        <button onClick={() => handleStatusChange(b._id, 'rejected')} className="px-3 py-1 text-sm rounded-lg bg-red-600 text-white font-bold shadow hover:bg-red-700 transition">Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-4 bg-white border-t border-gray-100 flex items-center justify-between rounded-b-xl">
              <div className="text-sm text-gray-500">Showing {Math.min((page-1)*pageSize+1, filteredBookingsRaw.length || 0)} to {Math.min(page*pageSize, filteredBookingsRaw.length)} of {filteredBookingsRaw.length} bookings</div>
              <div className="flex items-center space-x-2">
                <button onClick={() => setPage((p) => Math.max(1, p-1))} disabled={page <= 1} className="px-3 py-1 border rounded-lg disabled:opacity-50 bg-blue-50 hover:bg-blue-100 transition">Prev</button>
                <div className="text-sm text-blue-700 font-bold">Page {page} / {totalPages}</div>
                <button onClick={() => setPage((p) => Math.min(totalPages, p+1))} disabled={page >= totalPages} className="px-3 py-1 border rounded-lg disabled:opacity-50 bg-blue-50 hover:bg-blue-100 transition">Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
