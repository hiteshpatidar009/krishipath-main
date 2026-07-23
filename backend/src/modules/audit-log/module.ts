import { Router } from "express";
import { AuditLogContract, AuditLogContractAdapter } from "./contracts";
import { AuditLogController } from "./controllers/audit-log.controller";
import { AuditLogRepository } from "./repositories/audit-log.repository";
import { AuditLogRoutes } from "./routes/audit-log.routes";
import { AuditLogService } from "./services/audit-log.service";

export class AuditLogModule {
  private readonly auditLogRepository = new AuditLogRepository();
  private readonly auditLogService = new AuditLogService(this.auditLogRepository);
  private readonly auditLogController = new AuditLogController(this.auditLogService);
  private readonly auditLogRoutes = new AuditLogRoutes(this.auditLogController);
  private readonly auditLogContract = new AuditLogContractAdapter(
    this.auditLogService,
  );

  public getRouter(): Router {
    return this.auditLogRoutes.getRouter();
  }

  public getService(): AuditLogService {
    return this.auditLogService;
  }

  public getContract(): AuditLogContract {
    return this.auditLogContract;
  }
}
