import { AuthError } from "../errors/auth.error";

interface PasswordResetRateBucket {
  count: number;
  resetAt: number;
}

export class PasswordResetRateLimiter {
  private static readonly buckets = new Map<string, PasswordResetRateBucket>();

  public assertWithinLimit(
    scope: string,
    identifier: string | undefined,
    maxRequests: number,
    windowSeconds: number,
  ): void {
    const normalizedIdentifier = (identifier ?? "unknown").trim().toLowerCase();
    const key = `${scope}:${normalizedIdentifier}`;
    const now = Date.now();
    const current = PasswordResetRateLimiter.buckets.get(key);

    if (!current || current.resetAt <= now) {
      PasswordResetRateLimiter.buckets.set(key, {
        count: 1,
        resetAt: now + windowSeconds * 1000,
      });
      return;
    }

    current.count += 1;
    if (current.count > maxRequests) {
      throw new AuthError(429, "Too many password reset attempts. Please try again later.");
    }
  }

  public static reset(): void {
    PasswordResetRateLimiter.buckets.clear();
  }
}
