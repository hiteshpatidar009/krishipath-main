import { Schema, model } from 'mongoose';

const rewardItemSchema = new Schema({ id: String, label: String, amount: { type: Number, min: 0 }, enabled: Boolean }, { _id: false });
const rewardSettingsSchema = new Schema({ company: { type: Schema.Types.ObjectId, ref: 'Company', unique: true, required: true }, rewards: [rewardItemSchema], updatedBy: { type: Schema.Types.ObjectId, ref: 'User' } }, { timestamps: true });
const segmentSchema = new Schema({ publicId: { type: String, unique: true, required: true }, company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true }, name: { type: String, required: true }, states: [String], crops: [String], language: String, estimatedAudience: { type: Number, default: 0 }, createdBy: { type: Schema.Types.ObjectId, ref: 'User' }, deletedAt: { type: Date, default: null } }, { timestamps: true });
export const RewardSettings = model('RewardSettings', rewardSettingsSchema);
export const AudienceSegment = model('AudienceSegment', segmentSchema);
