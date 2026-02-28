/**
 * Client API backend Vote IAI (NotchPay)
 * En prod: VITE_API_URL doit être l'URL COMPLÈTE du backend (ex: https://votre-api.up.railway.app)
 * Sans "https://" le navigateur traite l'URL en relatif et appelle Vercel → 404.
 */
const rawBase = import.meta.env.VITE_API_URL || '';
const BASE =
  rawBase && !rawBase.startsWith('http://') && !rawBase.startsWith('https://')
    ? `https://${rawBase}`
    : rawBase;

export type PaymentChannel = 'cm.mtn' | 'cm.orange';

export interface PayVoteRequest {
  candidateId: string;
  packId: string;
  amount: number;
  channel: PaymentChannel;
  phone: string;
  email?: string;
}

export interface PayVoteResponse {
  success: boolean;
  reference?: string;
  message?: string;
}

export interface PaymentStatusResponse {
  reference: string;
  status: 'pending' | 'complete' | 'failed' | 'unknown';
  candidateId?: string | null;
  votes?: number | null;
}

export async function payVote(body: PayVoteRequest): Promise<PayVoteResponse> {
  const res = await fetch(`${BASE}/api/votes/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      success: false,
      message: data.message || `Erreur ${res.status}`,
    };
  }
  return data;
}

export async function getPaymentStatus(reference: string): Promise<PaymentStatusResponse | null> {
  const res = await fetch(`${BASE}/api/payments/${encodeURIComponent(reference)}/status`);
  if (!res.ok) return null;
  return res.json();
}

// --- Candidats, stats, packs (données réelles) ---

export interface Candidate {
  id: string;
  name: string;
  category: 'miss' | 'master';
  photo: string;
  votes: number;
  biography: string;
  badges: ('jury' | 'popular')[];
  gallery: string[];
  videoUrl?: string | null;
  videoUrls?: string[];
}

export interface VotePack {
  id: string;
  votes: number;
  price: number;
  popular: boolean;
}

export interface Stats {
  totalVotes: number;
  missVotes: number;
  masterVotes: number;
  missRanking: { id: string; name: string; category: string; totalVotes: number }[];
  masterRanking: { id: string; name: string; category: string; totalVotes: number }[];
}

export async function getCandidates(): Promise<Candidate[]> {
  const res = await fetch(`${BASE}/api/candidates`);
  if (!res.ok) throw new Error('Erreur chargement candidats');
  const data = await res.json();
  return data.map((c: Record<string, unknown>) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    photo: c.photo,
    votes: Number(c.votes ?? 0),
    biography: c.biography,
    badges: Array.isArray(c.badges) ? c.badges : [],
    gallery: Array.isArray(c.gallery) ? c.gallery : [],
    videoUrl: c.videoUrl ?? undefined,
  }));
}

export async function getCandidate(id: string): Promise<Candidate | null> {
  const res = await fetch(`${BASE}/api/candidates/${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  const c = await res.json();
  return {
    id: c.id,
    name: c.name,
    category: c.category,
    photo: c.photo,
    votes: Number(c.votes ?? 0),
    biography: c.biography,
    badges: Array.isArray(c.badges) ? c.badges : [],
    gallery: Array.isArray(c.gallery) ? c.gallery : [],
    videoUrl: c.videoUrl ?? undefined,
  };
}

export async function getStats(): Promise<Stats> {
  const res = await fetch(`${BASE}/api/stats`);
  if (!res.ok) throw new Error('Erreur chargement stats');
  return res.json();
}

export async function getVotePacks(): Promise<VotePack[]> {
  const res = await fetch(`${BASE}/api/vote-packs`);
  if (!res.ok) throw new Error('Erreur chargement packs');
  return res.json();
}
