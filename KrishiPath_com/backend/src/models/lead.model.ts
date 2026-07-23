import { Schema, model } from 'mongoose';

const leadSchema = new Schema({
  publicId: { type: String, required: true, unique: true },
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  campaign: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
  campaignPublicId: { type: String, required: true }, campaignName: { type: String, required: true },
  name: { type: String, required: true }, phone: { type: String, required: true }, state: { type: String, required: true, index: true },
  district: { type: String, required: true }, crop: { type: String, required: true, index: true },
  requestedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['new', 'contacted', 'interested', 'converted', 'not-interested'], default: 'new', index: true },
  landSize: String, language: String, notes: String,
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date, default: null, index: true },
}, { timestamps: true });
leadSchema.index({ company: 1, phone: 1, campaign: 1 }, { unique: true });
leadSchema.index({ name: 'text', district: 'text', phone: 'text' });
export const Lead = model('Lead', leadSchema);
