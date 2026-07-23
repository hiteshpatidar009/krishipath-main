import { LogCollectionName } from "../types/enterprise-log.types";
import { env } from "../../../infrastructure/config/env";

export class LogRetentionPolicyService {
  private static readonly daysByCollection: Record<LogCollectionName, number> = {
    user_activity_logs: env.userActivityLogRetentionDays,
    audit_logs: env.auditLogRetentionDays,
    platform_logs: env.platformLogRetentionDays,
  };

  public static ttlSeconds(collectionName: LogCollectionName): number {
    return this.daysByCollection[collectionName] * 24 * 60 * 60;
  }
}
