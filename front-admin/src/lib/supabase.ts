import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  '';

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const BUCKET = 'candidates';

function getPublicUrl(path: string): string {
  if (!supabaseUrl) return '';
  const base = supabaseUrl.replace(/\/$/, '');
  return `${base}/storage/v1/object/public/${BUCKET}/${path}`;
}

/**
 * Upload un fichier dans le bucket candidates et retourne l’URL publique.
 * pathPrefix : ex. "photos", "gallery", "videos"
 */
export async function uploadCandidateFile(
  file: File,
  pathPrefix: string
): Promise<string> {
  if (!supabase) throw new Error('Supabase non configuré (VITE_SUPABASE_URL et clé)');
  const ext = file.name.split('.').pop() || 'bin';
  const path = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return getPublicUrl(path);
}
