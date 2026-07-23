import { env } from "../../../infrastructure/config/env";
export class LogRetentionPolicyService {
    static daysByCollection = {
        user_activity_logs: env.userActivityLogRetentionDays,
        audit_logs: env.auditLogRetentionDays,
        platform_logs: env.platformLogRetentionDays,
    };
    static ttlSeconds(collectionName) {
        return this.daysByCollection[collectionName] * 24 * 60 * 60;
    }
}
