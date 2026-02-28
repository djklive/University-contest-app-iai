import { useState, useEffect } from 'react';
import { adminApi, type Payment } from '../lib/api';

export function AdminPayments() {
  const [data, setData] = useState<{ items: Payment[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.payments.list({ limit: 50, offset: 0, status: statusFilter || undefined });
      setData(res);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  if (loading) return <div className="card">Chargement...</div>;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ margin: 0 }}>Paiements</h2>
        <div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ marginRight: '0.5rem' }}>
            <option value="">Tous</option>
            <option value="pending">En attente</option>
            <option value="complete">Reussis</option>
            <option value="failed">Echoues</option>
          </select>
          <button type="button" className="btn btn-secondary" onClick={load}>Rafraichir</button>
        </div>
      </div>
      {error && <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>}
      {data && <p style={{ color: '#64748b', marginBottom: '1rem' }}>Total: {data.total}</p>}
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Statut</th>
              <th>Candidat</th>
              <th>Pack</th>
              <th>Montant</th>
              <th>Votes</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((p) => (
              <tr key={p.id}>
                <td><code style={{ fontSize: '0.75rem' }}>{p.reference}</code></td>
                <td><span className={`badge badge-${p.status === 'complete' ? 'complete' : p.status === 'failed' ? 'failed' : 'pending'}`}>{p.status}</span></td>
                <td>{p.candidateId}</td>
                <td>{p.packId}</td>
                <td>{p.amount} FCFA</td>
                <td>{p.votesCount}</td>
                <td>{new Date(p.createdAt).toLocaleString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
