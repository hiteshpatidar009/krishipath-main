import { AuditLogContractAdapter } from "./contracts";
import { AuditLogController } from "./controllers/audit-log.controller";
import { AuditLogRepository } from "./repositories/audit-log.repository";
import { AuditLogRoutes } from "./routes/audit-log.routes";
import { AuditLogService } from "./services/audit-log.service";
export class AuditLogModule {
    auditLogRepository = new AuditLogRepository();
    auditLogService = new AuditLogService(this.auditLogRepository);
    auditLogController = new AuditLogController(this.auditLogService);
    auditLogRoutes = new AuditLogRoutes(this.auditLogController);
    auditLogContract = new AuditLogContractAdapter(this.auditLogService);
    getRouter() {
        return this.auditLogRoutes.getRouter();
    }
    getService() {
        return this.auditLogService;
    }
    getContract() {
        return this.auditLogContract;
    }
}
