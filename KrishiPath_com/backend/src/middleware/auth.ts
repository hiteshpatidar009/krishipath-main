import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/user.model.js';
import { AppError } from '../shared/errors.js';

type Payload = { sub: string; type: 'access' };
export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : undefined;
    if (!token) throw new AppError(401, 'Authentication required', 'AUTH_REQUIRED');
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as Payload;
    if (payload.type !== 'access') throw new Error('Invalid token type');
    const user = await User.findOne({ _id: payload.sub, deletedAt: null, status: 'active' });
    if (!user) throw new AppError(401, 'User session is no longer valid', 'INVALID_SESSION');
    req.user = user;
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError(401, 'Invalid or expired access token', 'INVALID_TOKEN'));
  }
};

export const authorize = (...permissions: string[]): RequestHandler => (req, _res, next) => {
  if (!req.user) return next(new AppError(401, 'Authentication required'));
  if (req.user.role === 'root' || req.user.permissions.includes('all') || permissions.some((p) => req.user!.permissions.includes(p))) return next();
  return next(new AppError(403, 'You do not have permission for this action', 'FORBIDDEN'));
};
