import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthApi } from '../../api/api.js';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function validatePassword(pwd) {
    const errors = [];
    if (!pwd || pwd.length < 8) errors.push('at least 8 characters');
    return errors.length ? `Password must contain ${errors.join(', ')}` : null;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    try {
      await AuthApi.register({ email, password, role });
      // show nicer success message area instead of alert
      setError('');
      navigate('/login');
    } catch (err) {
      // fetch/handleResponse throws Error with message containing details
      setError(err.message || 'Registration failed.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit} aria-label="Registration form">
        <h2>Create account</h2>

        <div className="form-group">
          <label htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            className="input"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-password">Password</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              id="reg-password"
              className="input"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
          <small className="helper">Must contain at least 8 characters</small>
        </div>

        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <small className="helper">Admins have special permissions to manage rooms & bookings.</small>
        </div>

        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <p className="small-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
}
