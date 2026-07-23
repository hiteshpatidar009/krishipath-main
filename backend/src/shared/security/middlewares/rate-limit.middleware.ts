import { NextFunction, Request, Response } from "express";
import { logger } from "../../../infrastructure/logger";
import { RateLimitOptionsDto } from "../dtos/rate-limit-options.dto";
import { SecurityConstants } from "../constants/security.constants";

interface RateBucket {
  count: number;
  resetAt: number;
}

export class RateLimitMiddleware {
  private static readonly buckets = new Map<string, RateBucket>();

  public static use(options?: Partial<RateLimitOptionsDto>) {
    const resolved: RateLimitOptionsDto = {
      scope: options?.scope ?? "global",
      maxRequests: options?.maxRequests ?? SecurityConstants.defaultRateLimit,
      windowSeconds: options?.windowSeconds ?? SecurityConstants.rateWindowSeconds,
    };

    return (request: Request, response: Response, next: NextFunction): void => {
      const identifier = `${resolved.scope}:${request.ip ?? "unknown"}`;
      const now = Date.now();
      const current = RateLimitMiddleware.buckets.get(identifier);

      if (!current || current.resetAt <= now) {
        RateLimitMiddleware.buckets.set(identifier, {
          count: 1,
          resetAt: now + resolved.windowSeconds * 1000,
        });
        next();
        return;
      }

      current.count += 1;

      if (current.count > resolved.maxRequests) {
        void logger.warn("Rate limit exceeded", {
          module: "shared.security.rate-limit",
          ipAddress: request.ip,
          method: request.method,
          route: request.originalUrl,
          tags: ["security", "rate-limit", "blocked"],
        });

        response.status(429).json({
          success: false,
          message: "Too many requests",
          retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
        });
        return;
      }

      next();
    };
  }
}
