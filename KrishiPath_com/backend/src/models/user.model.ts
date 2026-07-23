import { Schema, model, Types, type InferSchemaType } from 'mongoose';

const userSchema = new Schema({
  publicId: { type: String, required: true, unique: true },
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true, unique: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  phone: String,
  avatarUrl: String,
  role: { type: String, enum: ['root', 'admin', 'member', 'viewer'], default: 'member', index: true },
  roleLabel: { type: String, default: 'Member' },
  permissions: [{ type: String }],
  status: { type: String, enum: ['active', 'invited', 'suspended'], default: 'active' },
  emailVerifiedAt: Date,
  invitationTokenHash: { type: String, select: false },
  invitationExpiresAt: Date,
  lastActive: Date,
  passwordChangedAt: Date,
  deletedAt: { type: Date, default: null, index: true },
}, { timestamps: true });

export type IUser = InferSchemaType<typeof userSchema> & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date };
export const User = model('User', userSchema);
