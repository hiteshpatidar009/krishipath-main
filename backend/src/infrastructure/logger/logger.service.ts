import { BaseService } from "../../core/base/base.service";
import { ConsoleTagLogger } from "./console-tag.logger";

import { ILoggerService } from "./logger.interface";
import { LoggerConstants } from "./logger.constants";
import { LoggerUtils } from "./logger.utils";
import { LogLevel, LogMetadata } from "./logger.types";
import {
  ApplicationLogRepository,
  LogWriteInput,
} from "./repositories/application-log.repository";
import { LogEntryValidator } from "./validators/log-entry.validator";
import { RequestTraceValidator } from "./validators/request-trace.validator";
import { AuditLogValidator } from "./validators/audit-log.validator";

export class LoggerService extends BaseService implements ILoggerService {
  constructor(
    private readonly logRepository: ApplicationLogRepository,
    private readonly logEntryValidator: LogEntryValidator,
  ) {
    super("LoggerService");
  }

  public async info(message: string, metadata?: LogMetadata): Promise<void> {
    await this.log(LoggerConstants.LEVEL_INFO, message, metadata);
  }

  public async warn(message: string, metadata?: LogMetadata): Promise<void> {
    await this.log(LoggerConstants.LEVEL_WARN, message, metadata);
  }

  public async debug(message: string, metadata?: LogMetadata): Promise<void> {
    await this.log(LoggerConstants.LEVEL_DEBUG, message, metadata);
  }

  public async error(error: Error, metadata?: LogMetadata): Promise<void> {
    await this.writeErrorLog(LoggerConstants.LEVEL_ERROR, error, metadata);
  }

  public async fatal(error: Error, metadata?: LogMetadata): Promise<void> {
    await this.writeErrorLog(LoggerConstants.LEVEL_FATAL, error, metadata);
  }

  public async security(
    message: string,
    metadata?: LogMetadata,
  ): Promise<void> {
    await this.log(LoggerConstants.LEVEL_SECURITY, message, {
      ...metadata,
      category: metadata?.category ?? "audit",
    });
  }

  public async log(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata,
  ): Promise<void> {
    try {
      const entry = this.buildLogEntry(level, message, metadata);
      this.logEntryValidator.validate(entry);
      await this.logRepository.create(entry);
    } catch (loggingError: unknown) {
      ConsoleTagLogger.error("LOGGER", "Failed to persist log", loggingError);
    }
  }

  private async writeErrorLog(
    level: LogLevel,
    error: Error,
    metadata?: LogMetadata,
  ): Promise<void> {
    try {
      const stack = LoggerUtils.extractStackInformation(error.stack);
      const errorMessage = error.message || "Unknown error";
      const entry = this.buildLogEntry(level, errorMessage, metadata);

      this.logEntryValidator.validate(entry);

      await this.logRepository.create({
        ...entry,
        errorName: error.name,
        stack: LoggerUtils.truncateMessage(
          error.stack ?? "",
          LoggerConstants.MAX_STACK_LENGTH,
        ),
        fileName: stack.fileName,
        functionName: stack.functionName,
        lineNumber: stack.lineNumber,
        columnNumber: stack.columnNumber,
      });
    } catch (loggingError: unknown) {
      ConsoleTagLogger.error(
        "LOGGER",
        "Failed to persist error log",
        loggingError,
      );
    }
  }

  private buildLogEntry(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata,
  ): LogWriteInput {
    RequestTraceValidator.validateRequestId(metadata?.requestId);
    AuditLogValidator.validateActor(metadata?.userId);

    return {
      level,
      message: LoggerUtils.truncateMessage(
        message,
        LoggerConstants.MAX_MESSAGE_LENGTH,
      ),
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
      headers:
        metadata?.headers ?
          LoggerUtils.sanitizeHeaders(metadata.headers)
        : undefined,
      tags: metadata?.tags ?? LoggerConstants.DEFAULT_TAGS,
      category: metadata?.category,
    };
  }
}

const applicationLogRepository = new ApplicationLogRepository();
const logEntryValidator = new LogEntryValidator();

export const logger: LoggerService = new LoggerService(
  applicationLogRepository,
  logEntryValidator,
);
