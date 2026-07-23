import { BaseValidator } from "../../../core/base/base.validator";
import { LoggerConstants } from "../logger.constants";
export class LogEntryValidator extends BaseValidator {
    allowedLevels = [
        LoggerConstants.LEVEL_INFO,
        LoggerConstants.LEVEL_WARN,
        LoggerConstants.LEVEL_WARNING,
        LoggerConstants.LEVEL_ERROR,
        LoggerConstants.LEVEL_DEBUG,
        LoggerConstants.LEVEL_FATAL,
        LoggerConstants.LEVEL_CRITICAL,
        LoggerConstants.LEVEL_SECURITY,
    ];
    validate(input) {
        if (!input.message || input.message.trim().length === 0) {
            throw new Error("Log message is required");
        }
        if (!this.allowedLevels.includes(input.level)) {
            throw new Error("Invalid log level");
        }
    }
}
