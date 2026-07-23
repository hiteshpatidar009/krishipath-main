export class SecurityConstants {
  public static readonly defaultJsonLimit = "1mb";
  public static readonly maxBodyBytes = 1024 * 1024;
  public static readonly defaultRateLimit = 300;
  public static readonly authRateLimit = 20;
  public static readonly rateWindowSeconds = 60;
  public static readonly idempotencyHeader = "idempotency-key";
  public static readonly signatureHeader = "x-krishipath-signature";
  public static readonly timestampHeader = "x-krishipath-timestamp";
  public static readonly maxClockSkewSeconds = 300;
}
