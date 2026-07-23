import { randomUUID } from "crypto";
import { LoggerUtils } from "../../../infrastructure/logger/logger.utils";
import { EnterpriseLogRepository } from "../repositories/enterprise-log.repository";
const CATEGORY_TO_COLLECTION = {
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
    repository;
    constructor(repository = new EnterpriseLogRepository()) {
        this.repository = repository;
    }
    async route(input) {
        const category = this.resolveCategory(input);
        const collectionName = CATEGORY_TO_COLLECTION[category];
        const log = this.enrichLog(input, category);
        await this.repository.create(collectionName, log);
        return { logId: log.logId, category, collectionName };
    }
    resolveCategory(input) {
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
    mapSeverity(level) {
        if (level === "warn")
            return "warning";
        if (level === "fatal")
            return "critical";
        if (["debug", "info", "error", "critical", "security", "warning"].includes(level)) {
            return level;
        }
        return "info";
    }
    async listCategory(category, companyId, limit, offset) {
        return this.repository.list(CATEGORY_TO_COLLECTION[category], companyId ? { companyId } : {}, limit, offset);
    }
    enrichLog(input, category) {
        const metadata = LoggerUtils.maskSensitiveData(input.metadata ?? {});
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
    searchText(input) {
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
    metadataTags(metadata) {
        const tags = metadata?.tags;
        return Array.isArray(tags) ? tags.map(String) : [];
    }
    matches(value, terms) {
        return terms.some((term) => value.includes(term));
    }
}
