import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';

function isAuthed() {
  return Boolean(localStorage.getItem('token'));
}

function PrivateRoute({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;  // ← lowercase
}

export default function App() {
  return (
    <div style={{ padding: 16 }}>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link to="/login">Login</Link>           {/* ← lowercase */}
        <Link to="/register">Register</Link>     {/* ← lowercase */}
      </nav>
      <Routes>
        <Route path="/login" element={<Login />} />        {/* ← lowercase */}
        <Route path="/register" element={<Register />} />  {/* ← lowercase */}
        <Route path="/" element={<PrivateRoute><div>Home (protected)</div></PrivateRoute>} />
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </div>
  );
}