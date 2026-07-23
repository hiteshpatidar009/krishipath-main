import { Router } from 'express';
import { z } from 'zod';
import { AudienceSegment, RewardSettings } from '../models/settings.model.js';
import { authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../shared/async-handler.js';
import { publicId } from '../shared/id.js';
import { ok } from '../shared/response.js';

export const settingsRouter = Router();
const defaultRewards = [{ id: 'video', label: 'Watch Video', amount: 2, enabled: true }, { id: 'quiz', label: 'Complete Quiz', amount: 5, enabled: true }, { id: 'brochure', label: 'Download Brochure', amount: 1, enabled: true }, { id: 'callback', label: 'Request Callback', amount: 20, enabled: true }];
settingsRouter.get('/rewards', asyncHandler(async (req, res) => { const settings = await RewardSettings.findOneAndUpdate({ company: req.user!.company }, { $setOnInsert: { rewards: defaultRewards } }, { upsert: true, new: true }); ok(res, settings.rewards); }));
settingsRouter.put('/rewards', authorize('rewards'), validate(z.object({ body: z.object({ rewards: z.array(z.object({ id: z.string(), label: z.string(), amount: z.number().min(0).max(10_000), enabled: z.boolean() })).min(1) }), query: z.any(), params: z.any() })), asyncHandler(async (req, res) => { const settings = await RewardSettings.findOneAndUpdate({ company: req.user!.company }, { rewards: req.body.rewards, updatedBy: req.user!._id }, { upsert: true, new: true, runValidators: true }); ok(res, settings.rewards, 'Reward settings saved'); }));
settingsRouter.get('/segments', asyncHandler(async (req, res) => ok(res, await AudienceSegment.find({ company: req.user!.company, deletedAt: null }).sort({ createdAt: -1 }).lean())));
settingsRouter.post('/segments', authorize('campaigns'), validate(z.object({ body: z.object({ name: z.string().min(2), states: z.array(z.string()).min(1), crops: z.array(z.string()).default([]), language: z.string().default('Hindi') }), query: z.any(), params: z.any() })), asyncHandler(async (req, res) => { const estimatedAudience = Math.round(req.body.states.length * 120_000 * (req.body.crops.length ? 0.3 : 1)); const segment = await AudienceSegment.create({ publicId: publicId('seg'), company: req.user!.company, ...req.body, estimatedAudience, createdBy: req.user!._id }); ok(res, segment, 'Audience segment saved', 201); }));
