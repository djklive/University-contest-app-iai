/**
 * Client API backend Vote IAI (NotchPay)
 * Base URL: VITE_API_URL (ex: http://localhost:3000 en dev, https://votre-api.railway.app en prod)
 */

const BASE = import.meta.env.VITE_API_URL || '';

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
