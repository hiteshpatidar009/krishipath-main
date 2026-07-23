import { RequestLoggerService } from "../services/request-logger.service";
import { PerformanceUtils } from "../utils/performance.utils";
export class RequestLoggerMiddleware {
    static requestLoggerService = new RequestLoggerService();
    static use(request, response, next) {
        const startedAt = PerformanceUtils.now();
        response.on("finish", () => {
            void RequestLoggerMiddleware.requestLoggerService.write(request, response, startedAt);
        });
        next();
    }
}
