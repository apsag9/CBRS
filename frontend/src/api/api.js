import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:4000/api',  // ✅ Correct
  withCredentials: true,
});

export const AuthApi = {
  login: (data) => api.post('/auth/login', data).then((r) => r.data),      // ✅ Correct
  register: (data) => api.post('/auth/register', data).then((r) => r.data), // ✅ Correct
};