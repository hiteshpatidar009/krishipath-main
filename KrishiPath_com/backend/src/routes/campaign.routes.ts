import { Router } from 'express';
import { Campaign } from '../models/campaign.model.js';
import { authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../shared/async-handler.js';
import { ok } from '../shared/response.js';
import { campaignView, createCampaign, findCampaign } from '../services/campaign.service.js';
import { createCampaignSchema, patchCampaignSchema } from '../validators/campaign.validator.js';

export const campaignRouter = Router();
campaignRouter.get('/', asyncHandler(async (req, res) => { const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20)); const filter: Record<string, unknown> = { company: req.user!.company, deletedAt: null }; if (req.query.status && req.query.status !== 'all') filter.status = req.query.status; if (req.query.search) filter.$text = { $search: req.query.search }; const [rows, total] = await Promise.all([Campaign.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Campaign.countDocuments(filter)]); ok(res, rows.map((x) => campaignView(x as unknown as Record<string, unknown>)), undefined, 200, { total, page, limit }); }));
campaignRouter.post('/', authorize('campaigns'), validate(createCampaignSchema), asyncHandler(async (req, res) => ok(res, await createCampaign(req.user!.company, req.user!._id, req.body), 'Campaign created', 201)));
campaignRouter.get('/:id', asyncHandler(async (req, res) => ok(res, campaignView((await findCampaign(req.user!.company, String(req.params.id))).toObject()))));
campaignRouter.patch('/:id', authorize('campaigns'), validate(patchCampaignSchema), asyncHandler(async (req, res) => { const c = await findCampaign(req.user!.company, String(req.params.id)); Object.assign(c, req.body, { updatedBy: req.user!._id }); await c.save(); ok(res, campaignView(c.toObject()), 'Campaign updated'); }));
campaignRouter.delete('/:id', authorize('campaigns'), asyncHandler(async (req, res) => { const c = await findCampaign(req.user!.company, String(req.params.id)); c.deletedAt = new Date(); await c.save(); res.status(204).send(); }));
campaignRouter.post('/:id/pause', authorize('campaigns'), asyncHandler(async (req, res) => { const c = await findCampaign(req.user!.company, String(req.params.id)); c.status = 'paused'; await c.save(); ok(res, campaignView(c.toObject()), 'Campaign paused'); }));
campaignRouter.post('/:id/resume', authorize('campaigns'), asyncHandler(async (req, res) => { const c = await findCampaign(req.user!.company, String(req.params.id)); c.status = 'active'; await c.save(); ok(res, campaignView(c.toObject()), 'Campaign resumed'); }));
campaignRouter.post('/:id/launch', authorize('campaigns'), asyncHandler(async (req, res) => { const c = await findCampaign(req.user!.company, String(req.params.id)); c.status = 'active'; c.launchDate ??= new Date(); await c.save(); ok(res, campaignView(c.toObject()), 'Campaign launched'); }));
campaignRouter.post('/:id/duplicate', authorize('campaigns'), asyncHandler(async (req, res) => { const source = (await findCampaign(req.user!.company, String(req.params.id))).toObject() as unknown as Record<string, unknown>; for (const key of ['_id', 'publicId', 'createdAt', 'updatedAt', '__v', 'launchDate']) delete source[key]; ok(res, await createCampaign(req.user!.company, req.user!._id, { ...source, name: `${source.name as string} (Copy)`, status: 'draft' }), 'Campaign duplicated', 201); }));
