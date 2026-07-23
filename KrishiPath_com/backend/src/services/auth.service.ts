import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Company } from '../models/company.model.js';
import { User, type IUser } from '../models/user.model.js';
import { ActionToken, RefreshToken } from '../models/token.model.js';
import { AppError } from '../shared/errors.js';
import { publicId } from '../shared/id.js';

const hash = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
const ttlMs = (value: string) => { const m = /^(\d+)([smhd])$/.exec(value); if (!m) return 900_000; const unit = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[m[2]!]!; return Number(m[1]) * unit; };

function signToken(user: IUser, type: 'access' | 'refresh', secret: string, expiresIn: string): string {
  return jwt.sign({ sub: String(user._id), companyId: String(user.company), role: user.role, type }, secret, { expiresIn, jwtid: crypto.randomUUID() } as SignOptions);
}

export async function issueTokens(user: IUser, context?: { ip?: string; userAgent?: string }) {
  const accessToken = signToken(user, 'access', env.JWT_ACCESS_SECRET, env.JWT_ACCESS_TTL);
  const refreshToken = signToken(user, 'refresh', env.JWT_REFRESH_SECRET, env.JWT_REFRESH_TTL);
  await RefreshToken.create({ user: user._id, tokenHash: hash(refreshToken), expiresAt: new Date(Date.now() + ttlMs(env.JWT_REFRESH_TTL)), ipAddress: context?.ip, userAgent: context?.userAgent });
  return { accessToken, refreshToken, expiresAt: Date.now() + ttlMs(env.JWT_ACCESS_TTL) };
}

export async function publicUser(user: IUser) {
  const company = await Company.findById(user.company).lean();
  if (!company) throw new AppError(401, 'Company account not found');
  return { id: user.publicId, name: user.name, email: user.email, role: user.role, companyId: company.companyId, companyName: company.name, companyInitials: company.initials, avatarUrl: user.avatarUrl, createdAt: (user as unknown as { createdAt: Date }).createdAt.toISOString() };
}

export async function login(email: string, password: string, companyId?: string, context?: { ip?: string; userAgent?: string }) {
  const user = await User.findOne({ email: email.toLowerCase(), deletedAt: null }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  if (user.status !== 'active') throw new AppError(403, `Account is ${user.status}`, 'ACCOUNT_INACTIVE');
  const company = await Company.findById(user.company);
  if (!company || company.deletedAt) throw new AppError(403, 'Company account is unavailable');
  if (companyId && company.companyId !== companyId) throw new AppError(401, 'Invalid company ID', 'INVALID_COMPANY');
  if (company.status === 'suspended') throw new AppError(403, 'Company account is suspended');
  user.lastActive = new Date(); await user.save();
  return { user: await publicUser(user), tokens: await issueTokens(user, context) };
}

export async function rotateRefreshToken(token: string, context?: { ip?: string; userAgent?: string }) {
  let payload: jwt.JwtPayload;
  try { payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as jwt.JwtPayload; } catch { throw new AppError(401, 'Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN'); }
  if (payload.type !== 'refresh') throw new AppError(401, 'Invalid refresh token');
  const record = await RefreshToken.findOne({ tokenHash: hash(token), revokedAt: null });
  if (!record || record.expiresAt < new Date()) throw new AppError(401, 'Refresh token has expired');
  const user = await User.findOne({ _id: payload.sub, status: 'active', deletedAt: null });
  if (!user) throw new AppError(401, 'User session is no longer valid');
  record.revokedAt = new Date();
  const tokens = await issueTokens(user, context);
  record.replacedByHash = hash(tokens.refreshToken); await record.save();
  return tokens;
}

export async function createActionToken(userId: unknown, purpose: 'password-reset' | 'email-verification' | 'otp', minutes = 30) {
  const token = crypto.randomBytes(32).toString('hex');
  await ActionToken.create({ user: userId, purpose, tokenHash: hash(token), expiresAt: new Date(Date.now() + minutes * 60_000) });
  return token;
}

export async function consumePasswordReset(token: string, password: string) {
  const record = await ActionToken.findOne({ tokenHash: hash(token), purpose: 'password-reset', usedAt: null, expiresAt: { $gt: new Date() } });
  if (!record) throw new AppError(400, 'Invalid or expired password reset token');
  const passwordHash = await bcrypt.hash(password, 12);
  await User.updateOne({ _id: record.user }, { passwordHash, passwordChangedAt: new Date() });
  record.usedAt = new Date(); await record.save();
  await RefreshToken.updateMany({ user: record.user, revokedAt: null }, { revokedAt: new Date() });
}
