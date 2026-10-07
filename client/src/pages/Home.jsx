import React from 'react';
import ItemList from '../components/ItemList';

export default function Home({ items, setItems, loading, error, onRefresh, dbStatus }) {
  return (
    <main className="main-content">
      <div className="hero">
        <h1 className="hero-title">React + Vite with MongoDB Cloud</h1>
        <p className="hero-description">
          A full-stack setup with clean modular folder architecture, React hooks,
          and Express + Mongoose backend connected to MongoDB Atlas.
        </p>

        {dbStatus !== 'connected' && (
          <div className="setup-banner">
            <div className="setup-banner-title">
              <span>&#9888;</span> MongoDB Cloud Setup Instructions:
            </div>
            <ol className="setup-steps">
              <li>Open <code>server/.env</code></li>
              <li>Paste your MongoDB Atlas connection string into <code>MONGODB_URI</code></li>
              <li>Start your servers using <code>npm run dev</code></li>
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
