import { Schema, model } from 'mongoose';

const refreshTokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  revokedAt: Date,
  replacedByHash: String,
  ipAddress: String,
  userAgent: String,
}, { timestamps: true });

const actionTokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  purpose: { type: String, enum: ['password-reset', 'email-verification', 'otp'], required: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  usedAt: Date,
}, { timestamps: true });

export const RefreshToken = model('RefreshToken', refreshTokenSchema);
export const ActionToken = model('ActionToken', actionTokenSchema);
