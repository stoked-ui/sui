import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';

export interface StoredAuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  clientId?: string;
  clientSlug?: string;
  avatarUrl?: string;
}

export interface StoredAuth {
  access_token: string;
  user: StoredAuthUser;
}

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = localStorage.getItem('auth');
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as StoredAuth;
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  return getStoredAuth()?.access_token || null;
}

export async function accountApiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(getApiUrl(url), {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function formatCurrency(amountInMinorUnits: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountInMinorUnits / 100);
}

export function formatShortDate(value?: string | null): string {
  if (!value) {
    return 'Not available';
  }

  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
