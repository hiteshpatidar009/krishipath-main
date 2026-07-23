import { AuthEvent } from "./auth-event.interface";

export class AuthEvents {
  public static loginSucceeded(
    userId: string,
    metadata?: Record<string, unknown>,
  ): AuthEvent {
    return {
      name: "auth.login.succeeded",
      userId,
      occurredAt: new Date().toISOString(),
      metadata,
    };
  }
}
