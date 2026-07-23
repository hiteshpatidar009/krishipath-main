import { Campaign } from '../models/campaign.model.js';
import { AppError } from '../shared/errors.js';
import { publicId } from '../shared/id.js';

export const campaignView = (c: Record<string, unknown>) => ({ id: c.publicId, name: c.name, status: c.status, goal: c.goal, description: c.description, reach: c.reach, videoViews: c.videoViews, quizCompletions: c.quizCompletions, brochureDownloads: c.brochureDownloads, callbackRequests: c.callbackRequests, walletUsed: c.walletUsed, videoReward: c.videoReward, quizReward: c.quizReward, brochureReward: c.brochureReward, callbackReward: c.callbackReward, dailyBudget: c.dailyBudget, launchDate: c.launchDate, endDate: c.endDate, targetStates: c.targetStates, targetDistricts: c.targetDistricts, targetCrops: c.targetCrops, targetLanguages: c.targetLanguages, language: c.language, videoUrl: c.videoUrl, brochureUrl: c.brochureUrl, quizQuestions: c.quizQuestions });

export async function findCampaign(company: unknown, id: string) {
  const campaign = await Campaign.findOne({ company, publicId: id, deletedAt: null });
  if (!campaign) throw new AppError(404, `Campaign ${id} not found`);
  return campaign;
}

export async function createCampaign(company: unknown, user: unknown, data: Record<string, unknown>) {
  const campaign = await Campaign.create({ ...data, publicId: publicId('c'), company, createdBy: user, updatedBy: user });
  return campaignView(campaign.toObject());
}
