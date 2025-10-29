import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthApi } from '../../api/api.js';  // ← Fixed path

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await AuthApi.register({ email, password, role });
      navigate('/login');  // ← Fixed to lowercase
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      console.error('Registration error:', err);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 320, margin: '40px auto' }}>
      <h2>Register</h2>
      <input 
        type="email"
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input 
        type="password"
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      {error ? <div style={{ color: 'red' }}>{error}</div> : null}
      <button type="submit">Create account</button>
    </form>
  );
}
