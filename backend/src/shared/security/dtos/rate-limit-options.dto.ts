export interface RateLimitOptionsDto {
  scope: string;
  maxRequests: number;
  windowSeconds: number;
}
