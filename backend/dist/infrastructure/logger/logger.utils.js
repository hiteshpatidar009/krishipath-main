import { LoggerConstants } from "./logger.constants";
import { BodySanitizerUtils } from "./utils/body-sanitizer.utils";
import { HeaderSanitizerUtils } from "./utils/header-sanitizer.utils";
import { StackTraceUtils } from "./utils/stack-trace.utils";
export class LoggerUtils {
    static maskSensitiveData(data) {
        return BodySanitizerUtils.sanitize(data, LoggerConstants.MASKED_FIELDS);
    }
    static truncateMessage(message, maxLength) {
        if (message.length <= maxLength) {
            return message;
        }
        return `${message.substring(0, maxLength)}...`;
    }
    static extractStackInformation(stack) {
        return StackTraceUtils.extract(stack);
    }
    static sanitizeHeaders(headers) {
        return HeaderSanitizerUtils.sanitize(headers, LoggerConstants.SENSITIVE_HEADERS);
    }
    static generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
}
