import { logger } from "./logger.service";
import { ErrorLoggerService } from "./services/error-logger.service";
import { AuditLoggerService } from "./services/audit-logger.service";
import { RequestLoggerService } from "./services/request-logger.service";
import { TraceLoggerService } from "./services/trace-logger.service";
import { SystemLoggerService } from "./services/system-logger.service";
export class LoggerModule {
    loggerService;
    errorLoggerService;
    auditLoggerService;
    requestLoggerService;
    traceLoggerService;
    systemLoggerService;
    constructor() {
        this.loggerService = logger;
        this.errorLoggerService = new ErrorLoggerService();
        this.auditLoggerService = new AuditLoggerService();
        this.requestLoggerService = new RequestLoggerService();
        this.traceLoggerService = new TraceLoggerService();
        this.systemLoggerService = new SystemLoggerService();
    }
}
