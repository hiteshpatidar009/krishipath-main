import { logger } from "../logger.service";
import { LogMetadata } from "../logger.types";

export class SystemLoggerService {
  public async write(message: string, metadata?: LogMetadata): Promise<void> {
    await logger.debug(message, metadata);
  }
}
