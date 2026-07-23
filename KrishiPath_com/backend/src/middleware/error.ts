import type { ErrorRequestHandler, RequestHandler } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { AppError } from '../shared/errors.js';
import { logger } from '../config/logger.js';

export const notFound: RequestHandler = (req, _res, next) => next(new AppError(404, `Route ${req.method} ${req.originalUrl} not found`, 'NOT_FOUND'));

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  let status = error instanceof AppError ? error.statusCode : 500;
  let code = error instanceof AppError ? error.code : 'INTERNAL_ERROR';
  let message = error instanceof Error ? error.message : 'Internal server error';
  let details = error instanceof AppError ? error.details : undefined;
  if (error instanceof ZodError) { status = 422; code = 'VALIDATION_ERROR'; message = 'Request validation failed'; details = error.issues; }
  if (error instanceof mongoose.Error.ValidationError) { status = 422; code = 'DATABASE_VALIDATION_ERROR'; details = Object.values(error.errors).map((e) => e.message); }
  if ((error as { code?: number }).code === 11000) { status = 409; code = 'DUPLICATE_RESOURCE'; message = 'A resource with these details already exists'; }
  if (status >= 500) logger.error(message, { error, requestId: req.requestId });
  res.status(status).json({ success: false, message, code, ...(details ? { details } : {}), requestId: req.requestId });
};
