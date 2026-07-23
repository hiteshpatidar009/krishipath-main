import { logger } from "../logger.service";
import { LogMetadata } from "../logger.types";

export class ErrorLoggerService {
  public async write(error: Error, metadata?: LogMetadata): Promise<void> {
    await logger.error(error, metadata);
  }
}
