import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { z } from 'zod';
import { User } from '../models/user.model.js';
import { authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../shared/async-handler.js';
import { AppError } from '../shared/errors.js';
import { publicId } from '../shared/id.js';
import { ok } from '../shared/response.js';

export const teamRouter = Router();
const view = (u: any) => ({ id: u.publicId, name: u.name, email: u.email, role: u.roleLabel, systemRole: u.role, phone: u.phone, joinedAt: u.createdAt, lastActive: u.lastActive, status: u.status, permissions: u.permissions });
teamRouter.get('/', authorize('team'), asyncHandler(async (req, res) => { const users = await User.find({ company: req.user!.company, deletedAt: null }).sort({ createdAt: 1 }).lean(); ok(res, users.map(view)); }));
teamRouter.post('/invite', authorize('team'), validate(z.object({ body: z.object({ name: z.string().min(2), email: z.email(), role: z.string().min(2), permissions: z.array(z.string()).default([]), phone: z.string().optional() }), query: z.any(), params: z.any() })), asyncHandler(async (req, res) => { if (await User.exists({ email: req.body.email.toLowerCase() })) throw new AppError(409, 'Email already belongs to a user'); const token = crypto.randomBytes(32).toString('hex'); const user = await User.create({ publicId: publicId('m'), company: req.user!.company, name: req.body.name, email: req.body.email, phone: req.body.phone, passwordHash: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12), role: 'member', roleLabel: req.body.role, permissions: req.body.permissions, status: 'invited', invitationTokenHash: crypto.createHash('sha256').update(token).digest('hex'), invitationExpiresAt: new Date(Date.now() + 7 * 86_400_000) }); ok(res, { member: view(user.toObject()), ...(process.env.NODE_ENV !== 'production' ? { invitationToken: token } : {}) }, 'Invitation created', 201); }));
teamRouter.patch('/:id', authorize('team'), validate(z.object({ body: z.object({ role: z.string().optional(), permissions: z.array(z.string()).optional(), status: z.enum(['active','invited','suspended']).optional() }), query: z.any(), params: z.any() })), asyncHandler(async (req, res) => { const target = await User.findOne({ company: req.user!.company, publicId: req.params.id, deletedAt: null }); if (!target) throw new AppError(404, 'Team member not found'); if (target.role === 'root') throw new AppError(403, 'Root account cannot be restricted'); if (req.body.role) target.roleLabel = req.body.role; if (req.body.permissions) target.permissions = req.body.permissions; if (req.body.status) target.status = req.body.status; await target.save(); ok(res, view(target.toObject()), 'Team member updated'); }));
teamRouter.delete('/:id', authorize('team'), asyncHandler(async (req, res) => { const target = await User.findOne({ company: req.user!.company, publicId: req.params.id, deletedAt: null }); if (!target) throw new AppError(404, 'Team member not found'); if (target.role === 'root') throw new AppError(403, 'Root account cannot be removed'); target.deletedAt = new Date(); target.status = 'suspended'; await target.save(); res.status(204).send(); }));
