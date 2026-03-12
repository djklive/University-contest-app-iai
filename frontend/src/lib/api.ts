/**
 * Client API backend Vote IAI (NotchPay uniquement)
 * En prod: VITE_API_URL doit être l'URL COMPLÈTE du backend (ex: https://votre-api.up.railway.app)
 */
const rawBase = import.meta.env.VITE_API_URL || '';
const BASE =
  rawBase && !rawBase.startsWith('http://') && !rawBase.startsWith('https://')
    ? `https://${rawBase}`
    : rawBase;

export interface NotchPayCountry {
  code: string;
  name: string;
  currency?: string;
  flag?: string;
  phone_code?: string;
  channels?: string[];
}

export interface NotchPayChannel {
  id: string;
  name: string;
  country: string;
  currency: string;
  type: string; // mobile_money | card | bank | ussd | qr | wallet
  logo?: string;
  minimum?: number;
  maximum?: number;
  requires_phone?: boolean;
}

export interface PayVoteRequest {
  candidateId: string;
  packId: string;
  amount: number;
  channel: string;
  phone: string;
  country?: string;
  email?: string;
}

export interface PayVoteResponse {
  success: boolean;
  reference?: string;
  message?: string;
  /** Redirection vers la page NotchPay (paiement carte). Présent uniquement pour les canaux type "card". */
  authorization_url?: string;
}

export interface PaymentStatusResponse {
  reference: string;
  status: 'pending' | 'complete' | 'failed' | 'unknown';
  candidateId?: string | null;
  votes?: number | null;
}

export async function getNotchPayCountries(): Promise<NotchPayCountry[]> {
  const res = await fetch(`${BASE}/api/notchpay/countries`);
  const data = await res.json().catch(() => ({}));
  return data.countries || [];
}

export async function getNotchPayChannels(country: string): Promise<NotchPayChannel[]> {
  const res = await fetch(`${BASE}/api/notchpay/channels?country=${encodeURIComponent(country)}`);
  const data = await res.json().catch(() => ({}));
  return data.channels || [];
}

export async function payVote(body: PayVoteRequest): Promise<PayVoteResponse> {
  const res = await fetch(`${BASE}/api/votes/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: data.message || `Erreur ${res.status}` };
  }
  return data;
}

export async function getPaymentStatus(reference: string): Promise<PaymentStatusResponse | null> {
  const res = await fetch(`${BASE}/api/payments/${encodeURIComponent(reference)}/status`);
  if (!res.ok) return null;
  return res.json();
}

// --- Candidats, stats, packs ---

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
    videoUrls: Array.isArray(c.videoUrls) ? c.videoUrls : undefined,
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
    videoUrls: Array.isArray(c.videoUrls) ? c.videoUrls : undefined,
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