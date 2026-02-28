import { useState, useEffect } from 'react';
import { adminApi, type Vote } from '../lib/api';

export function AdminVotes() {
  const [data, setData] = useState<{ items: Vote[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.votes.list({ limit: 50, offset: 0 });
      setData(res);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="card">Chargement...</div>;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Votes</h2>
        <button type="button" className="btn btn-secondary" onClick={load}>Rafraîchir</button>
      </div>
      {error && <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>}
      {data && <p style={{ color: '#64748b', marginBottom: '1rem' }}>Total : {data.total}</p>}

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Réf. paiement</th>
              <th>Candidat</th>
              <th>Catégorie</th>
              <th>Votes</th>
              <th>Montant</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((v) => (
              <tr key={v.id}>
                <td><code style={{ fontSize: '0.75rem' }}>{v.paymentReference}</code></td>
                <td>{v.candidate?.name ?? v.candidateId}</td>
                <td>{v.candidate?.category ?? '-'}</td>
                <td>{v.votesCount}</td>
                <td>{v.amount} FCFA</td>
                <td>{new Date(v.createdAt).toLocaleString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
