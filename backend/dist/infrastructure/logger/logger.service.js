import { BaseService } from "../../core/base/base.service";
import { ConsoleTagLogger } from "./console-tag.logger";
import { LoggerConstants } from "./logger.constants";
import { LoggerUtils } from "./logger.utils";
import { ApplicationLogRepository, } from "./repositories/application-log.repository";
import { LogEntryValidator } from "./validators/log-entry.validator";
import { RequestTraceValidator } from "./validators/request-trace.validator";
import { AuditLogValidator } from "./validators/audit-log.validator";
export class LoggerService extends BaseService {
    logRepository;
    logEntryValidator;
    constructor(logRepository, logEntryValidator) {
        super("LoggerService");
        this.logRepository = logRepository;
        this.logEntryValidator = logEntryValidator;
    }
    async info(message, metadata) {
        await this.log(LoggerConstants.LEVEL_INFO, message, metadata);
    }
    async warn(message, metadata) {
        await this.log(LoggerConstants.LEVEL_WARN, message, metadata);
    }
    async debug(message, metadata) {
        await this.log(LoggerConstants.LEVEL_DEBUG, message, metadata);
    }
    async error(error, metadata) {
        await this.writeErrorLog(LoggerConstants.LEVEL_ERROR, error, metadata);
    }
    async fatal(error, metadata) {
        await this.writeErrorLog(LoggerConstants.LEVEL_FATAL, error, metadata);
    }
    async security(message, metadata) {
        await this.log(LoggerConstants.LEVEL_SECURITY, message, {
            ...metadata,
            category: metadata?.category ?? "audit",
        });
    }
    async log(level, message, metadata) {
        try {
            const entry = this.buildLogEntry(level, message, metadata);
            this.logEntryValidator.validate(entry);
            await this.logRepository.create(entry);
        }
        catch (loggingError) {
            ConsoleTagLogger.error("LOGGER", "Failed to persist log", loggingError);
        }
    }
    async writeErrorLog(level, error, metadata) {
        try {
            const stack = LoggerUtils.extractStackInformation(error.stack);
            const errorMessage = error.message || "Unknown error";
            const entry = this.buildLogEntry(level, errorMessage, metadata);
            this.logEntryValidator.validate(entry);
            await this.logRepository.create({
                ...entry,
                errorName: error.name,
                stack: LoggerUtils.truncateMessage(error.stack ?? "", LoggerConstants.MAX_STACK_LENGTH),
                fileName: stack.fileName,
                functionName: stack.functionName,
                lineNumber: stack.lineNumber,
                columnNumber: stack.columnNumber,
            });
        }
        catch (loggingError) {
            ConsoleTagLogger.error("LOGGER", "Failed to persist error log", loggingError);
        }
    }
    buildLogEntry(level, message, metadata) {
        RequestTraceValidator.validateRequestId(metadata?.requestId);
        AuditLogValidator.validateActor(metadata?.userId);
        return {
            level,
            message: LoggerUtils.truncateMessage(message, LoggerConstants.MAX_MESSAGE_LENGTH),
            companyId: metadata?.companyId,
            organizationId: metadata?.organizationId,
            userId: metadata?.userId,
            actorId: metadata?.actorId,
            module: metadata?.module,
            action: metadata?.action,
            method: metadata?.method,
            route: metadata?.route,
            traceId: metadata?.traceId,
            correlationId: metadata?.correlationId,
            requestId: metadata?.requestId,
            ipAddress: metadata?.ipAddress,
            deviceFingerprint: metadata?.deviceFingerprint,
            executionDuration: metadata?.executionDuration,
            userAgent: metadata?.userAgent,
            payload: LoggerUtils.maskSensitiveData(metadata?.payload),
            response: LoggerUtils.maskSensitiveData(metadata?.response),
            headers: metadata?.headers ?
                LoggerUtils.sanitizeHeaders(metadata.headers)
                : undefined,
            tags: metadata?.tags ?? LoggerConstants.DEFAULT_TAGS,
            category: metadata?.category,
        };
    }
}
const applicationLogRepository = new ApplicationLogRepository();
const logEntryValidator = new LogEntryValidator();
export const logger = new LoggerService(applicationLogRepository, logEntryValidator);
