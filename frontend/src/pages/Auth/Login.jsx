import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthApi } from '../../api/api.js';  // ← Fixed path

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const result = await AuthApi.login({ email, password });
      localStorage.setItem('token', result.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      console.error('Login error:', err);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 320, margin: '40px auto' }}>
      <h2>Login</h2>
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
      {error ? <div style={{ color: 'red' }}>{error}</div> : null}
      <button type="submit">Login</button>
    </form>
  );
}