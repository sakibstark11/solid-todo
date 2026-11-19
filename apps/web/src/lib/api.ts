const API_BASE = '/api';

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
};

export type AuthResponse = Tokens & { user: User };

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(tokens: Tokens) {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
  localStorage.setItem('refreshToken', tokens.refreshToken);
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('refreshToken');
}

export function loadTokens() {
  const stored = localStorage.getItem('refreshToken');
  if (stored) refreshToken = stored;
}

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return refreshToken;
}

async function request(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const response = await fetch(url, { ...options, headers });
  if (response.status === 204) return undefined;

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error ?? `Request failed: ${response.status}`);
  }
  return body;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function me(): Promise<User> {
  return request('/auth/me');
}

export async function refresh(refreshTokenValue: string): Promise<Tokens> {
  return request('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  });
}
