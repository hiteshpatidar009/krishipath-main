// ─── API Configuration ────────────────────────────────────────────────────────

/**
 * Base URL for the real backend API.
 * Swap this environment variable when the backend is ready.
 * All API service files read from this constant — zero UI changes required.
 */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'https://api.krishipath.com/v1';

// ─── App Identity ─────────────────────────────────────────────────────────────

export const APP_NAME = 'KrishiPath' as const;
export const APP_TAGLINE = 'Company Portal' as const;
export const APP_VERSION = '1.0.0' as const;

// ─── Simulation ───────────────────────────────────────────────────────────────

/** Simulated API response delay range in milliseconds (for mock services). */
export const MOCK_DELAY_MIN_MS = 300;
export const MOCK_DELAY_MAX_MS = 700;

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const AUTH_TOKEN_KEY = 'krishipath_access_token' as const;
export const AUTH_REFRESH_KEY = 'krishipath_refresh_token' as const;
export const AUTH_USER_KEY = 'krishipath_user' as const;

/** Token expiry in milliseconds (1 hour for mock, real backend controls this). */
export const TOKEN_TTL_MS = 60 * 60 * 1000;

// ─── Pagination ───────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ─── Wallet ───────────────────────────────────────────────────────────────────

export const WALLET_PRESET_AMOUNTS = [500, 1000, 5000, 10_000, 25_000, 50_000] as const;
export const WALLET_MIN_TOPUP = 100;
export const PLATFORM_FEE_MONTHLY = 1000;

// ─── Campaigns ────────────────────────────────────────────────────────────────

export const CAMPAIGN_GOALS = [
  'Product Awareness',
  'Lead Generation',
  'Education',
  'Brand Building',
] as const;

export const CAMPAIGN_STATUSES = ['active', 'draft', 'paused', 'completed'] as const;

// ─── Geography ────────────────────────────────────────────────────────────────

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const;

export const CROP_TYPES = [
  'Wheat',
  'Rice',
  'Cotton',
  'Soybean',
  'Sugarcane',
  'Maize',
  'Mustard',
  'Chickpea',
  'Groundnut',
  'Tomato',
  'Onion',
  'Potato',
] as const;

export const LANGUAGES = ['Hindi', 'Marathi', 'Punjabi', 'Kannada', 'Gujarati', 'Tamil', 'Telugu'] as const;

export const BUSINESS_CATEGORIES = [
  'Fertilizer',
  'Pesticide',
  'Seed',
  'Bio-fertilizer',
  'Agri-equipment',
  'Agri-finance',
  'Other',
] as const;

// ─── User Roles ───────────────────────────────────────────────────────────────

export const ROLE_LABELS: Record<string, string> = {
  root: 'Root Admin',
  admin: 'Admin',
  member: 'Team Member',
  viewer: 'Viewer',
};

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  root: ['all'],
  admin: ['campaigns', 'leads', 'analytics', 'team', 'wallet'],
  member: ['campaigns', 'leads', 'analytics'],
  viewer: ['analytics'],
};
