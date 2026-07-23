import { BaseValidator } from "../../../core/base/base.validator";

import { LoggerConstants } from "../logger.constants";
import { LogLevel } from "../logger.types";
import { LogWriteInput } from "../repositories/application-log.repository";

export class LogEntryValidator extends BaseValidator<LogWriteInput> {
  private readonly allowedLevels: LogLevel[] = [
    LoggerConstants.LEVEL_INFO,
    LoggerConstants.LEVEL_WARN,
    LoggerConstants.LEVEL_WARNING,
    LoggerConstants.LEVEL_ERROR,
    LoggerConstants.LEVEL_DEBUG,
    LoggerConstants.LEVEL_FATAL,
    LoggerConstants.LEVEL_CRITICAL,
    LoggerConstants.LEVEL_SECURITY,
  ];

  public validate(input: LogWriteInput): void {
    if (!input.message || input.message.trim().length === 0) {
      throw new Error("Log message is required");
    }

    if (!this.allowedLevels.includes(input.level)) {
      throw new Error("Invalid log level");
    }
  }
}
