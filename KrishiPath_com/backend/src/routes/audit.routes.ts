import { Router } from 'express';
import { AuditLog } from '../models/audit.model.js';
import { authorize } from '../middleware/auth.js';
import { asyncHandler } from '../shared/async-handler.js';
import { ok } from '../shared/response.js';
export const auditRouter = Router();
auditRouter.get('/', authorize('team'), asyncHandler(async (req, res) => { const page = Math.max(1, Number(req.query.page) || 1), limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20)); const filter = { company: req.user!.company }; const [rows, total] = await Promise.all([AuditLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), AuditLog.countDocuments(filter)]); ok(res, rows, undefined, 200, { total, page, limit }); }));
