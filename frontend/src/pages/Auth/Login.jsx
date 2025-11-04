import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthApi } from '../../api/api.js';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email) return setError('Please enter your email');
    if (!password) return setError('Please enter your password');

    setLoading(true);
    try {
      const result = await AuthApi.login({ email, password });
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      // Redirect based on role
      if (result.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/rooms');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Check credentials and try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit} aria-label="Login form">
        <h2>Login to Confo Champs</h2>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-required="true"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              id="password"
              className="input"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-required="true"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((s) => !s)}
              aria-pressed={showPassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="small-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
}