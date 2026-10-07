import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import { useFetchItems } from './hooks/useFetchItems';
import { checkServerHealth } from './services/api';
import './App.css';

export default function App() {
  const { items, setItems, loading, error, refetch } = useFetchItems();
  const [dbStatus, setDbStatus] = useState('checking'); // 'connected' | 'disconnected' | 'checking'

  useEffect(() => {
    const verifyConnection = async () => {
      try {
        const res = await checkServerHealth();
        if (res.database === 'connected') {
          setDbStatus('connected');
        } else {
          setDbStatus('disconnected');
        }
      } catch {
        setDbStatus('disconnected');
      }
    };

    verifyConnection();
    const interval = setInterval(verifyConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app">
      <Navbar dbStatus={dbStatus} />
      <Home
        items={items}
        setItems={setItems}
        loading={loading}
        error={error}
        onRefresh={refetch}
        dbStatus={dbStatus}
      />
      <footer className="footer">
        <p>React (Vite) + MongoDB Cloud &bull; DPTS Project</p>
      </footer>
    </div>
  );
}
