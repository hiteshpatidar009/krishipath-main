import { LogLevel, LogMetadata } from "./logger.types";

export interface ILoggerService {
  info(message: string, metadata?: LogMetadata): Promise<void>;
  warn(message: string, metadata?: LogMetadata): Promise<void>;
  debug(message: string, metadata?: LogMetadata): Promise<void>;
  error(error: Error, metadata?: LogMetadata): Promise<void>;
  fatal(error: Error, metadata?: LogMetadata): Promise<void>;
  security(message: string, metadata?: LogMetadata): Promise<void>;
  log(level: LogLevel, message: string, metadata?: LogMetadata): Promise<void>;
}
