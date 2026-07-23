export class SoftDeleteUtil {
    static markDeleted(now = new Date()) {
        return {
            deletedAt: now,
            updatedAt: now,
        };
    }
}
