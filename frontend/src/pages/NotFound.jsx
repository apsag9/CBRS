import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <h1 style={{ fontSize: 72, margin: 0, color: '#2196F3' }}>404</h1>
      <h2 style={{ margin: '16px 0', color: '#666' }}>Page Not Found</h2>
      <p style={{ color: '#999', marginBottom: 24 }}>
        The page you're looking for doesn't exist.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '12px 24px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 16
        }}
      >
        Go Home
      </button>
    </div>
  );
}