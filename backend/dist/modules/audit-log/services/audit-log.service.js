import { logger } from "../../../infrastructure/logger";
import { AuditIntegrityService } from "./audit-integrity.service";
export class AuditLogService {
    auditLogRepository;
    auditIntegrityService;
    constructor(auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
        this.auditIntegrityService = new AuditIntegrityService(auditLogRepository);
    }
    async record(dto) {
        const id = await this.auditLogRepository.create(dto);
        await logger.info("Audit log recorded", {
            category: "audit",
            module: "audit-log.service",
            action: dto.action,
            companyId: dto.companyId,
            userId: dto.userId,
            tags: ["audit-log", "recorded"],
            payload: { id, action: dto.action, entityType: dto.entityType },
        });
        return { id };
    }
    async list(companyId, limit, offset) {
        return this.auditLogRepository.list(companyId, limit, offset);
    }
    async verifyIntegrity(companyId) {
        return this.auditIntegrityService.verifyTenantChain(companyId);
    }
}
