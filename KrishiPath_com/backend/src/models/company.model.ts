import { Schema, model, type InferSchemaType } from 'mongoose';

const companySchema = new Schema({
  companyId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 160 },
  initials: { type: String, required: true, maxlength: 4 },
  category: { type: String, required: true, index: true },
  gstNumber: { type: String, trim: true, uppercase: true, sparse: true, unique: true },
  panNumber: { type: String, trim: true, uppercase: true },
  website: String,
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  contactName: { type: String, required: true },
  address: { type: String, required: true },
  state: { type: String, required: true, index: true },
  city: String,
  pincode: String,
  logoUrl: String,
  kycDocuments: [{ kind: { type: String, required: true }, url: { type: String, required: true }, publicId: String }],
  status: { type: String, enum: ['pending', 'approved', 'suspended'], default: 'pending', index: true },
  verified: { type: Boolean, default: false },
  walletBalance: { type: Number, default: 0, min: 0 },
  totalRecharged: { type: Number, default: 0, min: 0 },
  totalSpent: { type: Number, default: 0, min: 0 },
  platformFees: { type: Number, default: 0, min: 0 },
  approvedAt: Date,
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date, default: null, index: true },
}, { timestamps: true, toJSON: { virtuals: true, transform: (_d, value) => { const ret = value as unknown as Record<string, unknown>; ret.id = ret.companyId; delete ret._id; delete ret.__v; } } });

companySchema.index({ name: 'text', email: 'text', companyId: 'text' });
export type ICompany = InferSchemaType<typeof companySchema>;
export const Company = model('Company', companySchema);
