import { Request, Response } from "express";
import { sendResponse } from "../shared/response";

export function notFoundMiddleware(req: Request, res: Response) {
  return sendResponse(
    res,
    404,
    `Route ${req.originalUrl} not found`
  );
}