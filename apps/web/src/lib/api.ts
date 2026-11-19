import { createMemo, createRoot, createSignal } from 'solid-js';

const API_BASE = '/api';
const REFRESH_KEY = 'refreshToken';

export type User = {
  id: string;
  name: string;
  email: string;
};

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = Tokens & { user: User };

let token: Promise<string | null> = Promise.resolve(null);
let session = new AbortController();

const [signedIn, setSignedIn] = createSignal(!!localStorage.getItem(REFRESH_KEY));

export function setTokens(t: Tokens & { user?: User }) {
  token = Promise.resolve(t.accessToken);
  localStorage.setItem(REFRESH_KEY, t.refreshToken);
  setSignedIn(true);
}

export function clearTokens() {
  session.abort();
  session = new AbortController();
  token = Promise.resolve(null);
  localStorage.removeItem(REFRESH_KEY);
  setSignedIn(false);
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!refresh) {
    clearTokens();
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
      signal: session.signal,
    });

    if (!response.ok) throw new Error('Refresh failed');

    const tokens: Tokens = await response.json();
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    token = Promise.resolve(tokens.accessToken);
    setSignedIn(true);
    return tokens.accessToken;
  } catch {
    clearTokens();
    return null;
  }
}

export async function fetchWithAuth(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE}${path}`;
  let accessToken = await token;

  const makeRequest = (t: string | null) => {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    if (t) headers.set('Authorization', `Bearer ${t}`);
    return fetch(url, { ...options, headers, signal: session.signal });
  };

  let response = await makeRequest(accessToken);

  if (response.status === 401) {
    accessToken = await refreshAccessToken();
    response = await makeRequest(accessToken);
  }

  return response;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetchWithAuth(path, options);
  if (response.status === 204) return undefined as T;

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error ?? `Request failed: ${response.status}`);
  }
  return body as T;
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  setTokens(response);
  return response;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setTokens(response);
  return response;
}

// Async memo: refetches whenever signedIn flips, suspends under <Loading>.
export const user = createRoot(() =>
  createMemo(() =>
    signedIn() ? request<User>('/auth/me').catch(() => null) : null
  )
);
