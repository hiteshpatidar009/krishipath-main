import { Router } from 'express';
import { Lead } from '../models/lead.model.js';
import { asyncHandler } from '../shared/async-handler.js';
import { ok } from '../shared/response.js';
export const analyticsRouter = Router();
analyticsRouter.get('/top-districts', asyncHandler(async (req, res) => { const rows = await Lead.aggregate([{ $match: { company: req.user!.company, deletedAt: null } }, { $group: { _id: '$district', reach: { $sum: 1 } } }, { $sort: { reach: -1 } }, { $limit: 5 }]); const max = rows[0]?.reach || 1; ok(res, rows.map((r) => ({ name: r._id, reach: r.reach, pct: Math.round(r.reach / max * 100) }))); }));
analyticsRouter.get('/top-crops', asyncHandler(async (req, res) => { const rows = await Lead.aggregate([{ $match: { company: req.user!.company, deletedAt: null } }, { $group: { _id: '$crop', engaged: { $sum: 1 } } }, { $sort: { engaged: -1 } }, { $limit: 5 }]); const max = rows[0]?.engaged || 1; ok(res, rows.map((r) => ({ name: r._id, engaged: r.engaged, pct: Math.round(r.engaged / max * 100) }))); }));
