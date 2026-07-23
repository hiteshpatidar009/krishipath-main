export interface AuthEvent {
  name: string;
  userId?: string;
  occurredAt: string;
  metadata?: Record<string, unknown>;
}
