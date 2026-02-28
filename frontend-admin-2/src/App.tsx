import { useState, useEffect } from 'react';
import { getAdminSecret, clearAdminSecret } from './lib/api';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

export default function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    setAuthenticated(!!getAdminSecret());
  }, []);

  const handleLogin = () => setAuthenticated(true);
  const handleLogout = () => {
    clearAdminSecret();
    setAuthenticated(false);
  };

  if (authenticated === null) {
    return <div className="container" style={{ paddingTop: '2rem', textAlign: 'center' }}>Chargement...</div>;
  }
  if (!authenticated) {
    return <Login onSuccess={handleLogin} />;
  }
  return <Dashboard onLogout={handleLogout} />;
}
