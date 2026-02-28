import { useState, useEffect, useRef } from 'react';
import { adminApi, type Candidate } from '../lib/api';
import { supabase, uploadCandidateFile } from '../lib/supabase';

export function AdminCandidates() {
  const [list, setList] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Candidate | null>(null);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<Partial<Candidate>>({ name: '', category: 'miss', photo: '', biography: '', badges: [], gallery: [], videoUrl: '' });
  const photoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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
    setCreating(true);
    setForm({ name: '', category: 'miss', photo: '', biography: '', badges: [], gallery: [], videoUrl: '' });
  };

  const openEdit = (c: Candidate) => {
    setEditing(c);
    setCreating(false);
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
      setCreating(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const cancelForm = () => {
    setEditing(null);
    setCreating(false);
    setError('');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!supabase) {
      setError('Supabase non configuré (VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env)');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const url = await uploadCandidateFile(file, 'photos');
      setForm((f) => ({ ...f, photo: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur upload photo');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !supabase) {
      if (!supabase) setError('Supabase non configuré.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadCandidateFile(files[i], 'gallery');
        urls.push(url);
      }
      setForm((f) => ({ ...f, gallery: [...(f.gallery || []), ...urls] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur upload galerie');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!supabase) {
      setError('Supabase non configuré.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const url = await uploadCandidateFile(file, 'videos');
      setForm((f) => ({ ...f, videoUrl: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur upload vidéo');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeGalleryUrl = (index: number) => {
    setForm((f) => ({
      ...f,
      gallery: (f.gallery || []).filter((_, i) => i !== index),
    }));
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
      {(creating || editing) && (
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
            <label>Photo</label>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploading}
              style={{ marginBottom: 4 }}
            />
            <input
              value={form.photo || ''}
              onChange={(e) => setForm({ ...form, photo: e.target.value })}
              placeholder="Ou coller une URL"
            />
            {form.photo && <img src={form.photo} alt="Aperçu" style={{ maxWidth: 120, maxHeight: 80, marginTop: 4, objectFit: 'cover', borderRadius: 4 }} />}
          </div>
          <div className="form-group">
            <label>Galerie (plusieurs images)</label>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              disabled={uploading}
              style={{ marginBottom: 4 }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {(form.gallery || []).map((url, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 4 }} />
                  <button type="button" onClick={() => removeGalleryUrl(i)} style={{ position: 'absolute', top: -4, right: -4, background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 12 }}>×</button>
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Biographie</label>
            <textarea value={form.biography || ''} onChange={(e) => setForm({ ...form, biography: e.target.value })} rows={3} />
          </div>
          <div className="form-group">
            <label>Badges</label>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 6 }}>
              Jury = profil visible, vote désactivé. Populaire = peut être ajouté automatiquement (top 3 par catégorie) ou coché ici.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={(form.badges || []).includes('jury')}
                  onChange={(e) => {
                    const badges = [...(form.badges || [])];
                    if (e.target.checked) badges.push('jury'); else badges.splice(badges.indexOf('jury'), 1);
                    setForm({ ...form, badges });
                  }}
                />
                Jury
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={(form.badges || []).includes('popular')}
                  onChange={(e) => {
                    const badges = [...(form.badges || [])];
                    if (e.target.checked) badges.push('popular'); else badges.splice(badges.indexOf('popular'), 1);
                    setForm({ ...form, badges });
                  }}
                />
                Populaire
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>Vidéo (optionnel)</label>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              disabled={uploading}
              style={{ marginBottom: 4 }}
            />
            <input value={form.videoUrl || ''} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="Ou coller une URL (YouTube, etc.)" />
          </div>
          {uploading && <p style={{ color: '#0ea5e9', marginBottom: 8 }}>Envoi en cours…</p>}
          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={save} disabled={uploading}>Enregistrer</button>
            <button type="button" className="btn btn-secondary" onClick={cancelForm}>Annuler</button>
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
