export class AuditLogValidator {
    static validateActor(userId) {
        if (!userId) {
            return;
        }
        if (userId.length > 200) {
            throw new Error("userId length exceeded");
        }
    }
}
