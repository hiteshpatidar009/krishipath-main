import { NextFunction, Request, Response } from "express";
import { SecurityConstants } from "../constants/security.constants";

export class RequestSizeLimitMiddleware {
  public static use(maxBytes = SecurityConstants.maxBodyBytes) {
    return (request: Request, response: Response, next: NextFunction): void => {
      const rawLength = request.headers["content-length"];
      const contentLength = typeof rawLength === "string" ? Number(rawLength) : 0;

      if (Number.isFinite(contentLength) && contentLength > maxBytes) {
        response.status(413).json({
          success: false,
          message: "Request payload too large",
        });
        return;
      }

      next();
    };
  }
}
