import { Router } from 'express';
import { Notification } from '../models/notification.model.js';
import { asyncHandler } from '../shared/async-handler.js';
import { AppError } from '../shared/errors.js';
import { ok } from '../shared/response.js';

export const notificationRouter = Router();
const scope = (req: any) => ({ company: req.user.company, $or: [{ user: req.user._id }, { user: null }] });
const view = (n: Record<string, unknown>) => ({ id: n.publicId, category: n.category, title: n.title, message: n.message, timestamp: n.createdAt, read: n.read, link: n.link });
notificationRouter.get('/', asyncHandler(async (req, res) => { const filter: Record<string, unknown> = scope(req); if (req.query.category && req.query.category !== 'all') filter.category = req.query.category; const rows = await Notification.find(filter).sort({ createdAt: -1 }).limit(100).lean(); ok(res, rows.map((n) => view(n as unknown as Record<string, unknown>))); }));
notificationRouter.get('/unread-count', asyncHandler(async (req, res) => ok(res, await Notification.countDocuments({ ...scope(req), read: false }))));
notificationRouter.patch('/:id/read', asyncHandler(async (req, res) => { const n = await Notification.findOneAndUpdate({ ...scope(req), publicId: req.params.id }, { read: true, readAt: new Date() }, { new: true }); if (!n) throw new AppError(404, 'Notification not found'); ok(res, null, 'Notification marked as read'); }));
notificationRouter.post('/mark-all-read', asyncHandler(async (req, res) => { await Notification.updateMany({ ...scope(req), read: false }, { read: true, readAt: new Date() }); ok(res, null, 'All notifications marked as read'); }));
