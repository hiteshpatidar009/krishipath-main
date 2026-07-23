import { RequestHandler } from "express";
import { AuditLogMiddleware } from "./middlewares/audit-log.middleware";
import { CorrelationMiddleware } from "./middlewares/correlation.middleware";
import { InputSanitizationMiddleware } from "./middlewares/input-sanitization.middleware";
import { IpFilterMiddleware } from "./middlewares/ip-filter.middleware";
import { RateLimitMiddleware } from "./middlewares/rate-limit.middleware";
import { RequestSizeLimitMiddleware } from "./middlewares/request-size-limit.middleware";
import { SuspiciousActivityMiddleware } from "./middlewares/suspicious-activity.middleware";
import { SecurityConstants } from "./constants/security.constants";

export class SecurityModule {
  public getGlobalMiddlewares(): RequestHandler[] {
    return [
      CorrelationMiddleware.use,
      RequestSizeLimitMiddleware.use(SecurityConstants.maxBodyBytes),
      IpFilterMiddleware.use(),
      RateLimitMiddleware.use(),
      InputSanitizationMiddleware.use,
      SuspiciousActivityMiddleware.use,
      AuditLogMiddleware.use,
    ];
  }
}
