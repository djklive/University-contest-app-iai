import { useState, useEffect } from 'react';
import { adminApi, type Candidate } from '../lib/api';

export function AdminCandidates() {
  const [list, setList] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Candidate | null>(null);
  const [form, setForm] = useState<Partial<Candidate>>({ name: '', category: 'miss', photo: '', biography: '', badges: [], gallery: [], videoUrl: '' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.candidates.list();
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
    setForm({ name: '', category: 'miss', photo: '', biography: '', badges: [], gallery: [], videoUrl: '' });
  };

  const openEdit = (c: Candidate) => {
    setEditing(c);
    setForm({
      name: c.name,
      category: c.category,
      photo: c.photo,
      biography: c.biography,
      badges: [...(c.badges || [])],
      gallery: [...(c.gallery || [])],
      videoUrl: c.videoUrl || '',
    });
  };

  const save = async () => {
    if (!form.name || !form.category || !form.photo || !form.biography) {
      setError('name, category, photo, biography requis');
      return;
    }
    setError('');
    try {
      const payload = {
        name: form.name,
        category: form.category,
        photo: form.photo,
        biography: form.biography,
        badges: Array.isArray(form.badges) ? form.badges : [],
        gallery: Array.isArray(form.gallery) ? form.gallery : [],
        videoUrl: form.videoUrl || null,
      };
      if (editing) {
        await adminApi.candidates.update(editing.id, payload);
      } else {
        await adminApi.candidates.create(payload);
      }
      setEditing(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer ce candidat ?')) return;
    try {
      await adminApi.candidates.delete(id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  };

  if (loading) return <div className="card">Chargement...</div>;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Candidats</h2>
        <button type="button" className="btn btn-primary" onClick={openCreate}>Ajouter</button>
      </div>
      {error && <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>}
      {(editing !== undefined && (editing || !list.length)) && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: 8 }}>
          <h3 style={{ marginTop: 0 }}>{editing ? 'Modifier' : 'Nouveau candidat'}</h3>
          <div className="form-group">
            <label>Nom</label>
            <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Categorie</label>
            <select value={form.category || 'miss'} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="miss">Miss</option>
              <option value="master">Master</option>
            </select>
          </div>
          <div className="form-group">
            <label>Photo (URL)</label>
            <input value={form.photo || ''} onChange={(e) => setForm({ ...form, photo: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Biographie</label>
            <textarea value={form.biography || ''} onChange={(e) => setForm({ ...form, biography: e.target.value })} rows={3} />
          </div>
          <div className="form-group">
            <label>Video URL (optionnel)</label>
            <input value={form.videoUrl || ''} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
          </div>
          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={save}>Enregistrer</button>
            <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setError(''); }}>Annuler</button>
          </div>
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Categorie</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.category}</td>
                <td>
                  <div className="actions">
                    <button type="button" className="btn btn-secondary" onClick={() => openEdit(c)}>Modifier</button>
                    <button type="button" className="btn btn-danger" onClick={() => remove(c.id)}>Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
