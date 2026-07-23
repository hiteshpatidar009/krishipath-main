import { logger } from "../logger.service";
import { LogMetadata } from "../logger.types";

export class AuditLoggerService {
  public async write(message: string, metadata?: LogMetadata): Promise<void> {
    await logger.info(message, metadata);
  }
}
