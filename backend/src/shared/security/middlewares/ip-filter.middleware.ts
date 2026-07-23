import { NextFunction, Request, Response } from "express";

export class IpFilterMiddleware {
  public static use(blockedIps: ReadonlySet<string> = new Set()) {
    return (request: Request, response: Response, next: NextFunction): void => {
      const ipAddress = request.ip ?? "";

      if (blockedIps.has(ipAddress)) {
        response.status(403).json({
          success: false,
          message: "IP blocked",
        });
        return;
      }

      next();
    };
  }
}
