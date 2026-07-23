export class SecurityConstants {
    static defaultJsonLimit = "1mb";
    static maxBodyBytes = 1024 * 1024;
    static defaultRateLimit = 300;
    static authRateLimit = 20;
    static rateWindowSeconds = 60;
    static idempotencyHeader = "idempotency-key";
    static signatureHeader = "x-krishipath-signature";
    static timestampHeader = "x-krishipath-timestamp";
    static maxClockSkewSeconds = 300;
}
