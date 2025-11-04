// api.js

// Default to backend dev port 4001 (common default). For stability set VITE_API_BASE_URL in frontend/.env.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4001/api';

// Helper for Authorization + Content-Type headers
const authHeaders = (json = false) => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    ...(json && { 'Content-Type': 'application/json' })
  };
};

// Helper to handle fetch safely and handle token refresh
const handleResponse = async (response, errorMessage, retryCallback) => {
  if (response.status === 401 && response.statusText.includes('Token expired')) {
    // Try to refresh the token
    const refreshed = await AuthApi.refreshToken();
    if (refreshed && retryCallback) {
      // Retry the original request with new token
      return retryCallback();
    }
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${errorMessage}: ${text || response.statusText}`);
  }
  return response.json();
};

// 🟢 AUTH API
export const AuthApi = {
  register: async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await handleResponse(response, 'Registration failed');
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  login: async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await handleResponse(response, 'Login failed');

      if (resData.token) {
        localStorage.setItem('token', resData.token);
        localStorage.setItem('user', JSON.stringify(resData.user));
      }

      return resData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  refreshToken: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: authHeaders()
      });

      if (!response.ok) {
        // If refresh fails, logout user
        AuthApi.logout();
        return false;
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      AuthApi.logout();
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// 🟣 BOOKINGS API
export const BookingApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/bookings`, { headers: authHeaders() });
    return handleResponse(response, 'Failed to fetch all bookings');
  },

  getMyBookings: async () => {
    const response = await fetch(`${API_BASE_URL}/bookings/my`, { headers: authHeaders() });
    return handleResponse(response, 'Failed to fetch my bookings');
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify(data)
    });
    return handleResponse(response, 'Failed to create booking');
  },

  update: async (bookingId, data) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: authHeaders(true),
      body: JSON.stringify(data)
    });
    return handleResponse(response, 'Failed to update booking');
  },

  cancel: async (bookingId, cancellationReason = '') => {
    // Use the same endpoint as updateStatus — mark booking as 'cancelled'
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: authHeaders(true),
      body: JSON.stringify({ status: 'cancelled', cancellationReason })
    });
    return handleResponse(response, 'Failed to cancel booking');
  },

  updateStatus: async (bookingId, data) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: authHeaders(true),
      body: JSON.stringify(data)
    });
    return handleResponse(response, 'Failed to update booking status');
  },

  delete: async (bookingId) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    return handleResponse(response, 'Failed to delete booking');
  }
};

// 🟡 ROOM API
export const RoomApi = {
  getAll: async (params = {}) => {
    const makeRequest = async () => {
      const qs = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/rooms${qs ? `?${qs}` : ''}`;
      const response = await fetch(url, { headers: authHeaders() });
      return handleResponse(response, 'Failed to fetch rooms', () => makeRequest());
    };
    return makeRequest();
  },

  getById: async (roomId) => {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, { headers: authHeaders() });
    return handleResponse(response, 'Failed to fetch room');
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/admin/rooms`, {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify(data)
    });
    return handleResponse(response, 'Failed to create room');
  },

  update: async (roomId, data) => {
    const response = await fetch(`${API_BASE_URL}/admin/rooms/${roomId}`, {
      method: 'PUT',
      headers: authHeaders(true),
      body: JSON.stringify(data)
    });
    return handleResponse(response, 'Failed to update room');
  },

  delete: async (roomId) => {
    const response = await fetch(`${API_BASE_URL}/admin/rooms/${roomId}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    return handleResponse(response, 'Failed to delete room');
  }
};

// ⚙️ ADMIN / REPORTS API
export const AdminApi = {
  exportBookingsCsv: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/reports/export${qs ? `?${qs}` : ''}`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Failed to export bookings CSV');
    return response.blob();
  },

  getRoomUtilization: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/reports/room-utilization${qs ? `?${qs}` : ''}`, { headers: authHeaders() });
    return handleResponse(response, 'Failed to fetch room utilization');
  },

  getUserActivity: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/reports/user-activity${qs ? `?${qs}` : ''}`, { headers: authHeaders() });
    return handleResponse(response, 'Failed to fetch user activity');
  },

  getActivityLogs: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/activity-logs${qs ? `?${qs}` : ''}`, { headers: authHeaders() });
    return handleResponse(response, 'Failed to fetch activity logs');
  }
};
