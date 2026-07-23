import { LoggerConstants } from "./logger.constants";
import { BodySanitizerUtils } from "./utils/body-sanitizer.utils";
import { HeaderSanitizerUtils } from "./utils/header-sanitizer.utils";
import { StackTraceUtils } from "./utils/stack-trace.utils";

export class LoggerUtils {
  public static maskSensitiveData(data: unknown): unknown {
    return BodySanitizerUtils.sanitize(data, LoggerConstants.MASKED_FIELDS);
  }

  public static truncateMessage(message: string, maxLength: number): string {
    if (message.length <= maxLength) {
      return message;
    }

    return `${message.substring(0, maxLength)}...`;
  }

  public static extractStackInformation(stack?: string): {
    fileName?: string;
    lineNumber?: number;
    columnNumber?: number;
    functionName?: string;
  } {
    return StackTraceUtils.extract(stack);
  }

  public static sanitizeHeaders(
    headers: Record<string, unknown>,
  ): Record<string, unknown> {
    return HeaderSanitizerUtils.sanitize(
      headers,
      LoggerConstants.SENSITIVE_HEADERS,
    );
  }

  public static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}
