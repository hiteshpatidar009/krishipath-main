import type { User, AuthTokens } from '../../types';
import { delay } from '../../utils/formatters';
import {
  AUTH_TOKEN_KEY,
  AUTH_REFRESH_KEY,
  AUTH_USER_KEY,
  TOKEN_TTL_MS,
  MOCK_DELAY_MIN_MS,
  MOCK_DELAY_MAX_MS,
} from '../../utils/constants';

// ─── Mock User Store ───────────────────────────────────────────────────────────

const MOCK_USERS: Record<string, User & { password: string }> = {
  'admin@agrogrow.in': {
    id: 'u-001',
    name: 'Arjun Mehta',
    email: 'admin@agrogrow.in',
    role: 'root',
    companyId: 'KP-C-00842',
    companyName: 'AgroGrow India Pvt. Ltd.',
    companyInitials: 'AG',
    createdAt: '2026-01-15',
    password: 'demo1234',
  },
  'priya@agrogrow.in': {
    id: 'u-002',
    name: 'Priya Sharma',
    email: 'priya@agrogrow.in',
    role: 'admin',
    companyId: 'KP-C-00842',
    companyName: 'AgroGrow India Pvt. Ltd.',
    companyInitials: 'AG',
    createdAt: '2026-02-01',
    password: 'demo1234',
  },
};

// ─── Token Helpers ────────────────────────────────────────────────────────────

const generateMockToken = (userId: string): string =>
  `mock_token_${userId}_${Date.now()}`;

const storeTokens = (tokens: AuthTokens, user: User): void => {
  localStorage.setItem(AUTH_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(AUTH_REFRESH_KEY, tokens.refreshToken);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ user, expiresAt: tokens.expiresAt }));
};

const clearTokens = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_REFRESH_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

// ─── Auth API ─────────────────────────────────────────────────────────────────

/**
 * Authenticates a user with email + password.
 *
 * BACKEND SWAP: Replace the mock logic with:
 *   const res = await fetch(`${API_BASE_URL}/auth/login`, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ email, password, companyId }),
 *   });
 *   return res.json();
 */
export const login = async (
  email: string,
  password: string,
  _companyId?: string
): Promise<{ user: User; tokens: AuthTokens }> => {
  await delay(MOCK_DELAY_MIN_MS + Math.random() * (MOCK_DELAY_MAX_MS - MOCK_DELAY_MIN_MS));

  const mockUser = MOCK_USERS[email.toLowerCase()];

  // Accept any non-empty credentials in demo mode
  if (!mockUser && !email) throw new Error('User not found');

  const user: User = mockUser ?? {
    id: 'u-demo',
    name: 'Demo User',
    email,
    role: 'member',
    companyId: 'KP-C-00842',
    companyName: 'AgroGrow India Pvt. Ltd.',
    companyInitials: 'AG',
    createdAt: new Date().toISOString(),
  };

  const tokens: AuthTokens = {
    accessToken: generateMockToken(user.id),
    refreshToken: generateMockToken(user.id + '_refresh'),
    expiresAt: Date.now() + TOKEN_TTL_MS,
  };

  storeTokens(tokens, user);
  return { user, tokens };
};

/**
 * Logs out the current user and clears stored tokens.
 *
 * BACKEND SWAP: Add a POST to /auth/logout before clearing.
 */
export const logout = async (): Promise<void> => {
  await delay(100);
  clearTokens();
};

/**
 * Returns the currently stored user, or null if session expired.
 *
 * BACKEND SWAP: Replace with GET /auth/me (use stored token in Authorization header).
 */
export const getMe = async (): Promise<User | null> => {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    const { user, expiresAt } = JSON.parse(raw) as { user: User; expiresAt: number };
    if (Date.now() > expiresAt) {
      clearTokens();
      return null;
    }
    return user;
  } catch {
    clearTokens();
    return null;
  }
};

/**
 * Refreshes the access token using the refresh token.
 *
 * BACKEND SWAP: POST /auth/refresh with { refreshToken }.
 */
export const refreshToken = async (): Promise<AuthTokens | null> => {
  const storedRefresh = localStorage.getItem(AUTH_REFRESH_KEY);
  if (!storedRefresh) return null;

  await delay(300);

  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  const { user } = JSON.parse(raw) as { user: User };
  const tokens: AuthTokens = {
    accessToken: generateMockToken(user.id),
    refreshToken: storedRefresh,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  };
  storeTokens(tokens, user);
  return tokens;
};

/**
 * Registers a new company.
 *
 * BACKEND SWAP: POST /auth/register with FormData (includes logo file).
 */
export const register = async (payload: Record<string, unknown>): Promise<{ companyId: string }> => {
  await delay(1800);
  console.info('[Mock] Registered company with payload:', payload);
  return { companyId: `KP-C-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}` };
};

export const authApi = { login, logout, getMe, refreshToken, register };
