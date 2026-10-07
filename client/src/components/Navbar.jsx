import React from 'react';

export default function Navbar({ dbStatus }) {
  const getStatusBadge = () => {
    switch (dbStatus) {
      case 'connected':
        return (
          <span className="badge badge-success">
            <span className="dot dot-success"></span> MongoDB Cloud Connected
          </span>
        );
      case 'disconnected':
        return (
          <span className="badge badge-error">
            <span className="dot dot-error"></span> MongoDB Disconnected
          </span>
        );
      default:
        return (
          <span className="badge badge-warning">
            <span className="dot dot-warning"></span> Checking Status...
          </span>
        );
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="logo-container">
          <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
          </svg>
          <span className="brand-title">DPTS MERN App</span>
        </div>
        <div className="status-container">
          {getStatusBadge()}
        </div>
      </div>
    </header>
  );
}
