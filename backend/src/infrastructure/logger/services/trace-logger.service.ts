import { LoggerUtils } from "../logger.utils";

export class TraceLoggerService {
  public createRequestId(): string {
    return LoggerUtils.generateRequestId();
  }
}
