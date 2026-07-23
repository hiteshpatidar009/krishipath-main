import type { RequestHandler } from 'express';
import crypto from 'node:crypto';
import { AuditLog } from '../models/audit.model.js';

export const requestContext: RequestHandler = (req, res, next) => {
  req.requestId = req.get('x-request-id') || crypto.randomUUID();
  res.setHeader('x-request-id', req.requestId);
  next();
};

export const auditMutations: RequestHandler = (req, res, next) => {
  if (!['POST','PUT','PATCH','DELETE'].includes(req.method)) return next();
  res.on('finish', () => {
    if (res.statusCode >= 400 || !req.user) return;
    void AuditLog.create({ company: req.user.company, actor: req.user._id, action: `${req.method} ${req.route?.path ?? req.path}`, entityType: req.baseUrl.split('/').pop(), entityId: req.params.id, after: sanitize(req.body), ipAddress: req.ip, userAgent: req.get('user-agent'), requestId: req.requestId });
  });
  next();
};

function sanitize(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  const blocked = new Set(['password','newPassword','currentPassword','refreshToken','token']);
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).filter(([k]) => !blocked.has(k)).map(([k,v]) => [k, sanitize(v)]));
}
