export class AuditLogValidator {
  public static validateActor(userId?: string): void {
    if (!userId) {
      return;
    }

    if (userId.length > 200) {
      throw new Error("userId length exceeded");
    }
  }
}
