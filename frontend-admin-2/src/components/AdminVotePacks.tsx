import { useState, useEffect } from 'react';
import { adminApi } from '../lib/api';

type Pack = { id: string; votes: number; price: number; popular: boolean };

export function AdminVotePacks() {
  const [list, setList] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Pack | null>(null);
  const [form, setForm] = useState({ id: '', votes: 1, price: 100, popular: false });

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.votePacks.list();
      setList(data);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ id: '', votes: 1, price: 100, popular: false });
  };

  const openEdit = (p: Pack) => {
    setEditing(p);
    setForm({ id: p.id, votes: p.votes, price: p.price, popular: p.popular });
  };

  const save = async () => {
    if (!form.id.trim() || form.votes < 1 || form.price < 1) {
      setError('id, votes et price requis');
      return;
    }
    setError('');
    try {
      if (editing) {
        await adminApi.votePacks.update(editing.id, { votes: form.votes, price: form.price, popular: form.popular });
      } else {
        await adminApi.votePacks.create({ id: form.id, votes: form.votes, price: form.price, popular: form.popular });
      }
      setEditing(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer ce pack ?')) return;
    try {
      await adminApi.votePacks.delete(id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  };

  if (loading) return <div className="card">Chargement...</div>;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Packs de vote</h2>
        <button type="button" className="btn btn-primary" onClick={openCreate}>Ajouter</button>
      </div>
      {error && <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>}
      {(editing || !list.length) && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: 8 }}>
          <h3 style={{ marginTop: 0 }}>{editing ? 'Modifier le pack' : 'Nouveau pack'}</h3>
          <div className="form-group">
            <label>ID (ex: single, pack5)</label>
            <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} disabled={!!editing} />
          </div>
          <div className="form-group">
            <label>Nombre de votes</label>
            <input type="number" min={1} value={form.votes} onChange={(e) => setForm({ ...form, votes: Number(e.target.value) || 0 })} />
          </div>
          <div className="form-group">
            <label>Prix (FCFA)</label>
            <input type="number" min={1} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })} />
          </div>
          <div className="form-group">
            <label><input type="checkbox" checked={form.popular} onChange={(e) => setForm({ ...form, popular: e.target.checked })} /> Populaire</label>
          </div>
          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={save}>Enregistrer</button>
            <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setError(''); }}>Annuler</button>
          </div>
        </div>
      )}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Votes</th>
            <th>Prix (FCFA)</th>
            <th>Populaire</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.votes}</td>
              <td>{p.price}</td>
              <td>{p.popular ? 'Oui' : 'Non'}</td>
              <td>
                <div className="actions">
                  <button type="button" className="btn btn-secondary" onClick={() => openEdit(p)}>Modifier</button>
                  <button type="button" className="btn btn-danger" onClick={() => remove(p.id)}>Supprimer</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
