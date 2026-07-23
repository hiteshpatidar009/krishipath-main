import { LoggerUtils } from "../logger.utils";
export class TraceLoggerService {
    createRequestId() {
        return LoggerUtils.generateRequestId();
    }
}
