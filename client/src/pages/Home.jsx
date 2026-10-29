import React from 'react';
import ItemList from '../components/ItemList';
import OfficeLogo from '../components/OfficeLogo';
import { UserCheck } from 'lucide-react';

export default function Home({
  items,
  setItems,
  loading,
  error,
  onRefresh,
  dbStatus,
  currentUser,
}) {
  return (
    <main className="main-content">
      {/* Officer Welcome Header */}
      {currentUser && (
        <div className="officer-welcome-banner animate-fade-in">
          <div className="officer-banner-left">
            <UserCheck size={24} className="banner-icon-success" />
            <div>
              <h3 className="officer-name">Welcome, {currentUser.name}</h3>
              <p className="officer-details">
                {currentUser.role} &bull; {currentUser.office || 'Zonal Education Office Katugastota'}
                {currentUser.employeeId ? ` &bull; ID: ${currentUser.employeeId}` : ''}
              </p>
            </div>
          </div>
          <div className="officer-status-badge">
            <span className="dot dot-success"></span>
            <span>Active Session</span>
          </div>
        </div>
      )}

      <div className="hero">
        <div className="hero-emblem-badge">
          <OfficeLogo size={90} />
        </div>
        <h1 className="hero-title">Development Progress Tracking System</h1>
        <h2 className="hero-sinhala-title">කටුගස්තොට කලාප අධ්‍යාපන කාර්යාලය</h2>
        <p className="hero-description">
          Zonal Education Office Katugastota &bull; Sri Lanka.
          Official platform for tracking zonal development initiatives, school progress, and educational projects.
        </p>

        {dbStatus !== 'connected' && (
          <div className="setup-banner">
            <div className="setup-banner-title">
              <span>&#9888;</span> MongoDB Cloud Status Note:
            </div>
            <ol className="setup-steps">
              <li>Open <code>server/.env</code></li>
              <li>Paste your MongoDB Atlas connection string into <code>MONGODB_URI</code></li>
              <li>Your database connection is currently checked automatically.</li>
            </ol>
          </div>
        )}
      </div>

      <ItemList
        items={items}
        setItems={setItems}
        loading={loading}
        error={error}
        onRefresh={onRefresh}
      />
    </main>
  );
}
