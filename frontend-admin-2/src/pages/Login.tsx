import { useState } from 'react';
import { setAdminSecret } from '../lib/api';
import { adminApi } from '../lib/api';

type Props = { onSuccess: () => void };

export function Login({ onSuccess }: Props) {
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!secret.trim()) {
      setError('Saisissez le secret admin.');
      return;
    }
    setLoading(true);
    try {
      setAdminSecret(secret.trim());
      await adminApi.candidates.list();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Secret invalide ou API inaccessible.');
      setAdminSecret('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400, marginTop: '4rem' }}>
      <div className="card">
        <h1 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Admin Vote IAI</h1>
        <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Entrez le secret admin (variable ADMIN_SECRET du backend).
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="secret">Secret admin</label>
            <input
              id="secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="ADMIN_SECRET"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
          {error && (
            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Verification...' : 'Acceder a l admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
