import { EnterpriseLogRepository, LogRouterService } from "../../../shared/logger";
import { HashUtil } from "../../../shared/utils/hash.util";
export class AuditLogRepository {
    enterpriseLogRepository = new EnterpriseLogRepository();
    logRouterService = new LogRouterService(this.enterpriseLogRepository);
    async create(dto) {
        const metadata = dto.metadata ?? {};
        const payloadHash = HashUtil.sha256({ ...dto, metadata });
        const previousHash = await this.getPreviousChainHash(dto.companyId);
        const chainHash = HashUtil.sha256(`${previousHash ?? "GENESIS"}:${payloadHash}`);
        const result = await this.logRouterService.route({
            category: "audit",
            severity: "security",
            module: dto.module ?? "audit-log",
            action: dto.action,
            message: `${dto.entityType} audit event recorded`,
            companyId: dto.companyId,
            organizationId: dto.organizationId,
            warehouseId: dto.warehouseId,
            userId: dto.userId,
            actorId: dto.userId,
            status: dto.status ?? "success",
            requestId: dto.requestId,
            correlationId: dto.correlationId,
            ipAddress: dto.ipAddress,
            userAgent: dto.userAgent,
            metadata: {
                entityType: dto.entityType,
                entityId: dto.entityId,
                warehouseId: dto.warehouseId,
                status: dto.status ?? "success",
                beforeState: dto.beforeState,
                afterState: dto.afterState,
                changedFields: dto.changedFields,
                previousHash,
                payloadHash,
                chainHash,
                metadata,
            },
        });
        return result.logId;
    }
    async list(companyId, limit, offset) {
        return this.logRouterService.listCategory("audit", companyId, limit, offset);
    }
    async listChain(companyId) {
        const records = await this.enterpriseLogRepository.list("audit_logs", { companyId }, 10000, 0);
        return records.reverse().map((row) => ({
            id: row.logId,
            previousHash: typeof row.metadata.previousHash === "string" ? row.metadata.previousHash : null,
            chainHash: String(row.metadata.chainHash ?? ""),
        }));
    }
    async getPreviousChainHash(companyId) {
        return this.enterpriseLogRepository.latestAuditHash(companyId);
    }
}
