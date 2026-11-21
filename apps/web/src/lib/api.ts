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

export type TodoAccess = 'owner' | 'view' | 'edit';

export type Todo = {
  id: string;
  title: string;
  description: string;
  complete: boolean;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  ownerName: string;
  access: TodoAccess;
};

export type Share = {
  id: string;
  userId: string;
  name: string;
  email: string;
  permission: 'view' | 'edit';
  createdAt: string;
};

export type UserResult = User;

export type Page<T> = {
  items: T[];
  total: number;
  pageSize: number;
  nextCursor: string | null;
};

// The current access token. While a refresh is running this holds the pending
// refresh promise, so anyone who awaits it waits for the new token.
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

// Never rejects. Doesn't assign `token`: the caller stores this promise there.
async function doRefresh(): Promise<string | null> {
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!refresh) {
    clearTokens();
    return null;
  }

  const { signal } = session;

  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
      signal,
    });

    if (!response.ok) throw new Error('Refresh failed');

    const tokens: Tokens = await response.json();

    // Logged out while the body was downloading: don't resurrect the session.
    if (signal.aborted) return null;

    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    setSignedIn(true);
    return tokens.accessToken;
  } catch {
    // If aborted, clearTokens() already ran. Calling it again would abort
    // the fresh session that replaced it.
    if (!signal.aborted) clearTokens();
    return null;
  }
}

export async function fetchWithAuth(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE}${path}`;

  const makeRequest = (t: string | null) => {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    if (t) headers.set('Authorization', `Bearer ${t}`);
    return fetch(url, { ...options, headers, signal: session.signal });
  };

  const used = token;
  let response = await makeRequest(await used);

  if (response.status === 401) {
    // Same promise as when we started: nobody has refreshed yet, so we do it.
    // Different promise: another request already started (or finished) a
    // refresh, so just wait on that one.
    if (token === used) token = doRefresh();
    response = await makeRequest(await token);
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

export function listTodos(tab: 'mine' | 'shared', cursor: string | null = null) {
  const params = new URLSearchParams({ tab });
  if (cursor) params.set('cursor', cursor);
  return request<Page<Todo>>(`/todos?${params}`);
}

export function getTodo(id: string) {
  return (async () => {
    for (const tab of ['mine', 'shared'] as const) {
      let cursor: string | null = null;
      do {
        const page = await listTodos(tab, cursor);
        const match = page.items.find((item) => item.id === id);
        if (match) return match;
        cursor = page.nextCursor;
      } while (cursor);
    }
    throw new Error('Todo not found');
  })();
}

export function createTodo(values: { title: string; description: string }) {
  return request<Todo>('/todos', {
    method: 'POST',
    body: JSON.stringify(values),
  });
}

export function updateTodo(
  id: string,
  values: { title?: string; description?: string; complete?: boolean }
) {
  return request<Todo>(`/todos/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  });
}

export function deleteTodo(id: string) {
  return request<void>(`/todos/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function listShares(id: string, cursor: string | null = null) {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  const query = params.toString();
  return request<Page<Share>>(
    `/todos/${encodeURIComponent(id)}/shares${query ? `?${query}` : ''}`
  );
}

export function shareTodo(
  id: string,
  userId: string,
  permission: Share['permission']
) {
  return request<void>(`/todos/${encodeURIComponent(id)}/shares`, {
    method: 'POST',
    body: JSON.stringify({ userId, permission }),
  });
}

export function unshareTodo(id: string, userId: string) {
  return request<void>(
    `/todos/${encodeURIComponent(id)}/shares/${encodeURIComponent(userId)}`,
    { method: 'DELETE' }
  );
}

export function searchUsers(name: string, cursor: string | null = null) {
  const params = new URLSearchParams({ q: name });
  if (cursor) params.set('cursor', cursor);
  return request<Page<UserResult>>(`/users/search?${params}`);
}

// Async memo: refetches whenever signedIn flips, suspends under <Loading>.
export const user = createRoot(() =>
  createMemo(() =>
    signedIn() ? request<User>('/auth/me').catch(() => null) : null
  )
);
