import { z } from 'zod';
const quizQuestion = z.union([
  z.object({ question: z.string().min(1), options: z.array(z.string()).min(2), correctAnswer: z.number().int().nonnegative() }),
  z.object({ q: z.string().min(1), opts: z.array(z.string()).min(2), ans: z.number().int().nonnegative() }).transform((q) => ({ question: q.q, options: q.opts, correctAnswer: q.ans })),
]);
const bodyFields = { name: z.string().min(2).max(160), goal: z.string().min(2), description: z.string().max(3000).default(''), videoReward: z.coerce.number().min(0), quizReward: z.coerce.number().min(0), brochureReward: z.coerce.number().min(0), callbackReward: z.coerce.number().min(0), dailyBudget: z.coerce.number().positive(), endDate: z.coerce.date().optional(), targetStates: z.array(z.string()).min(1), targetDistricts: z.array(z.string()).optional(), targetCrops: z.array(z.string()).default([]), targetLanguages: z.array(z.string()).optional(), language: z.string().optional(), videoUrl: z.string().optional(), brochureUrl: z.string().optional(), hasVideo: z.boolean().optional(), hasBrochure: z.boolean().optional(), quizQuestions: z.array(quizQuestion).optional(), status: z.enum(['active', 'draft', 'paused', 'completed']).optional() };
const omitFlags = ({ hasVideo: _video, hasBrochure: _brochure, ...value }: Record<string, unknown>) => value;
export const createCampaignSchema = z.object({ body: z.object(bodyFields).transform(omitFlags), query: z.any(), params: z.any() });
export const patchCampaignSchema = z.object({ body: z.object(bodyFields).partial().transform(omitFlags), query: z.any(), params: z.any() });
