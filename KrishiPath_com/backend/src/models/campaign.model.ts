import { Schema, model } from 'mongoose';

const quizSchema = new Schema({ question: { type: String, required: true }, options: [{ type: String, required: true }], correctAnswer: { type: Number, required: true, min: 0 } }, { _id: false });
const campaignSchema = new Schema({
  publicId: { type: String, required: true, unique: true, index: true },
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true, maxlength: 160 },
  goal: { type: String, required: true },
  description: { type: String, default: '', maxlength: 3000 },
  status: { type: String, enum: ['active', 'draft', 'paused', 'completed'], default: 'draft', index: true },
  reach: { type: Number, default: 0, min: 0 }, videoViews: { type: Number, default: 0, min: 0 },
  quizCompletions: { type: Number, default: 0, min: 0 }, brochureDownloads: { type: Number, default: 0, min: 0 },
  callbackRequests: { type: Number, default: 0, min: 0 }, walletUsed: { type: Number, default: 0, min: 0 },
  videoReward: { type: Number, default: 0, min: 0 }, quizReward: { type: Number, default: 0, min: 0 },
  brochureReward: { type: Number, default: 0, min: 0 }, callbackReward: { type: Number, default: 0, min: 0 },
  dailyBudget: { type: Number, required: true, min: 1 }, launchDate: Date, endDate: Date,
  targetStates: [{ type: String }], targetDistricts: [{ type: String }], targetCrops: [{ type: String }], targetLanguages: [{ type: String }],
  language: String, videoUrl: String, brochureUrl: String, quizQuestions: [quizSchema],
  deletedAt: { type: Date, default: null, index: true },
}, { timestamps: true });

campaignSchema.index({ company: 1, status: 1, createdAt: -1 });
campaignSchema.index({ name: 'text', description: 'text' });
export const Campaign = model('Campaign', campaignSchema);
