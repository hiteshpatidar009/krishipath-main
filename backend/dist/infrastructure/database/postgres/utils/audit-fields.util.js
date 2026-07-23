export class AuditFieldsUtil {
    static insertFields(now = new Date()) {
        return {
            createdAt: now,
            updatedAt: now,
        };
    }
    static updateFields(now = new Date()) {
        return {
            updatedAt: now,
        };
    }
}
