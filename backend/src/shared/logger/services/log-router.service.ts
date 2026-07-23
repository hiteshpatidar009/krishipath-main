import { randomUUID } from "crypto";
import { LoggerUtils } from "../../../infrastructure/logger/logger.utils";
import { EnterpriseLogRepository } from "../repositories/enterprise-log.repository";
import {
  EnterpriseLogDocument,
  EnterpriseLogInput,
  LogCategory,
  LogCollectionName,
  LogRoutingDecision,
  LogSeverity,
} from "../types/enterprise-log.types";

const CATEGORY_TO_COLLECTION: Record<LogCategory, LogCollectionName> = {
  user_activity: "user_activity_logs",
  audit: "audit_logs",
  platform: "platform_logs",
};


const AUDIT_TERMS = [
  "audit",
  "security",
  "permission",
  "role",
  "company",
  "settings",
  "api-key",
  "mfa",
  "auth.mfa",
  "password.reset",
  "session.revoke",
  "organization",
];

const ACTIVITY_TERMS = [
  "login",
  "logout",
  "profile",
  "customer",
  "supplier",
  "workflow",
  "approval",
  "document",
  "search",
  "dashboard",
  "warehouse",
  "inventory",
  "procurement",
  "user.",
];

export class LogRouterService {
  public constructor(private readonly repository = new EnterpriseLogRepository()) {}

  public async route(input: EnterpriseLogInput): Promise<LogRoutingDecision> {
    const category = this.resolveCategory(input);
    const collectionName = CATEGORY_TO_COLLECTION[category];
    const log = this.enrichLog(input, category);
    await this.repository.create(collectionName, log);
    return { logId: log.logId, category, collectionName };
  }

  public resolveCategory(input: EnterpriseLogInput): LogCategory {
    if (input.category) {
      return input.category;
    }

    const haystack = this.searchText(input);
    if (this.matches(haystack, AUDIT_TERMS)) {
      return "audit";
    }

    if (this.matches(haystack, ACTIVITY_TERMS)) {
      return "user_activity";
    }

    return "platform";
  }

  public mapSeverity(level: string): LogSeverity {
    if (level === "warn") return "warning";
    if (level === "fatal") return "critical";
    if (["debug", "info", "error", "critical", "security", "warning"].includes(level)) {
      return level as LogSeverity;
    }
    return "info";
  }

  public async listCategory(
    category: LogCategory,
    companyId: string | undefined,
    limit: number,
    offset: number,
  ): Promise<EnterpriseLogDocument[]> {
    return this.repository.list(
      CATEGORY_TO_COLLECTION[category],
      companyId ? { companyId } : {},
      limit,
      offset,
    );
  }

  private enrichLog(input: EnterpriseLogInput, category: LogCategory): EnterpriseLogDocument {
    const metadata = LoggerUtils.maskSensitiveData(input.metadata ?? {}) as Record<string, unknown>;
    return {
      logId: randomUUID(),
      category,
      severity: input.severity,
      module: input.module,
      action: input.action,
      message: input.message,
      companyId: input.companyId,
      organizationId: input.organizationId,
      warehouseId: input.warehouseId,
      userId: input.userId,
      actorId: input.actorId ?? input.userId,
      status: input.status,
      traceId: input.traceId ?? input.correlationId ?? input.requestId,
      correlationId: input.correlationId ?? input.traceId ?? input.requestId,
      requestId: input.requestId,
      ipAddress: input.ipAddress,
      deviceFingerprint: input.deviceFingerprint,
      executionDuration: input.executionDuration,
      metadata: {
        ...metadata,
        ...(input.userAgent ? { userAgent: input.userAgent } : {}),
      },
      createdAt: new Date(),
    };
  }

  private searchText(input: EnterpriseLogInput): string {
    return [
      input.category,
      input.module,
      input.action,
      input.message,
      ...this.metadataTags(input.metadata),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }

  private metadataTags(metadata: Record<string, unknown> | undefined): string[] {
    const tags = metadata?.tags;
    return Array.isArray(tags) ? tags.map(String) : [];
  }

  private matches(value: string, terms: string[]): boolean {
    return terms.some((term) => value.includes(term));
  }
}
