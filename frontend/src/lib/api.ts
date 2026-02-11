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
