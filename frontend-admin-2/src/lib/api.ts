const ADMIN_SECRET_KEY = 'vote_iai_admin_secret';

const getBase = () => {
  const u = import.meta.env.VITE_API_URL || '';
  return u.startsWith('http') ? u : u ? `https://${u}` : '';
};

export function getAdminSecret(): string | null {
  return sessionStorage.getItem(ADMIN_SECRET_KEY);
}

export function setAdminSecret(secret: string): void {
  sessionStorage.setItem(ADMIN_SECRET_KEY, secret);
}

export function clearAdminSecret(): void {
  sessionStorage.removeItem(ADMIN_SECRET_KEY);
}

function headers(): HeadersInit {
  const secret = getAdminSecret();
  return {
    'Content-Type': 'application/json',
    ...(secret ? { 'x-admin-secret': secret } : {}),
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${getBase()}${path}`, {
    ...options,
    headers: { ...headers(), ...options.headers },
  });
  if (res.status === 401) {
    clearAdminSecret();
    window.location.href = '/';
    throw new Error('Non autorisé');
  }
  const text = await res.text();
  if (!res.ok) throw new Error(text || `Erreur ${res.status}`);
  return text ? JSON.parse(text) : (null as T);
}

export interface Candidate {
  id: string;
  name: string;
  category: string;
  photo: string;
  biography: string;
  badges: string[];
  gallery: string[];
  videoUrl: string | null;
}

export interface Payment {
  id: string;
  reference: string;
  status: string;
  candidateId: string;
  packId: string;
  amount: number;
  votesCount: number;
  notchpayRef: string | null;
  createdAt: string;
}

export interface Vote {
  id: string;
  candidateId: string;
  paymentReference: string;
  votesCount: number;
  amount: number;
  createdAt: string;
  candidate?: { name: string; category: string };
}

export const adminApi = {
  candidates: {
    list: () => request<Candidate[]>('/api/admin/candidates'),
    create: (data: Partial<Candidate>) =>
      request<Candidate>('/api/admin/candidates', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Candidate>) =>
      request<Candidate>(`/api/admin/candidates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/api/admin/candidates/${id}`, { method: 'DELETE' }),
  },
  votePacks: {
    list: () => request<{ id: string; votes: number; price: number; popular: boolean }[]>('/api/admin/vote-packs'),
    create: (data: { id: string; votes: number; price: number; popular?: boolean }) =>
      request('/api/admin/vote-packs', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { votes?: number; price?: number; popular?: boolean }) =>
      request(`/api/admin/vote-packs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/api/admin/vote-packs/${id}`, { method: 'DELETE' }),
  },
  payments: {
    list: (params?: { limit?: number; offset?: number; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.offset) q.set('offset', String(params.offset));
      if (params?.status) q.set('status', params.status);
      return request<{ items: Payment[]; total: number }>(`/api/admin/payments?${q}`);
    },
  },
  votes: {
    list: (params?: { limit?: number; offset?: number; candidateId?: string }) => {
      const q = new URLSearchParams();
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.offset) q.set('offset', String(params.offset));
      if (params?.candidateId) q.set('candidateId', params.candidateId);
      return request<{ items: Vote[]; total: number }>(`/api/admin/votes?${q}`);
    },
  },
};
