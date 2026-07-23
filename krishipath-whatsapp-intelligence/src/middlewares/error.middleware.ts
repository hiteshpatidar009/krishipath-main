import { NextFunction, Request, Response } from "express";
import { logger } from "../logger/logger";
import { AppError } from "../shared/errors";
import { sendResponse } from "../shared/response";
import { env } from "../config/env";

export function errorMiddleware(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error(error);

  if (error instanceof AppError) {
    return sendResponse(
      res,
      error.statusCode,
      error.message
    );
  }

  if (env.NODE_ENV === "development") {
    return res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }

  return sendResponse(
    res,
    500,
    "Internal Server Error"
  );
}