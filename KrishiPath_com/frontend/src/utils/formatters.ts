// ─── Currency ─────────────────────────────────────────────────────────────────

/**
 * Formats a number as Indian currency (₹).
 * ≥1L → ₹X.XXL  |  ≥1K → ₹X.XK  |  else → ₹X,XX,XXX
 */
export const formatCurrency = (amount: number): string => {
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(2)}L`;
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

// ─── Numbers ──────────────────────────────────────────────────────────────────

/**
 * Formats a large number in compact Indian notation.
 */
export const formatNumber = (n: number): string => {
  if (n >= 100_000) return `${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('en-IN');
};

// ─── Dates ────────────────────────────────────────────────────────────────────

/**
 * Formats an ISO date string as "02 Jul 2026".
 */
export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

/**
 * Returns a human-readable relative time string ("5m ago", "2h ago", "3d ago").
 */
export const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
};

// ─── Phone ────────────────────────────────────────────────────────────────────

/**
 * Masks a phone number: 9812345678 → 98•••••678
 */
export const maskPhone = (phone: string): string =>
  phone.slice(0, 2) + '•••••' + phone.slice(-3);

// ─── Strings ──────────────────────────────────────────────────────────────────

/**
 * Returns initials from a full name: "Ramesh Patil" → "RP"
 */
export const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

/**
 * Truncates a string to maxLen characters with an ellipsis.
 */
export const truncate = (str: string, maxLen: number): string =>
  str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str;

// ─── Misc ─────────────────────────────────────────────────────────────────────

/**
 * Creates a delay Promise for simulating async operations in mock services.
 */
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Returns a random integer between min and max (inclusive).
 */
export const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Returns a random element from an array.
 */
export const randomFrom = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
