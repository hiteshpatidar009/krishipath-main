import { Schema, model } from 'mongoose';

const transactionSchema = new Schema({
  publicId: { type: String, required: true, unique: true },
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  type: { type: String, enum: ['recharge', 'campaign-spend', 'reward-distributed', 'platform-fee', 'bonus'], required: true, index: true },
  amount: { type: Number, required: true }, description: { type: String, required: true },
  balance: { type: Number, required: true, min: 0 }, invoiceId: String,
  paymentMethod: { type: String, enum: ['upi', 'netbanking', 'card'] }, gatewayReference: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
transactionSchema.index({ company: 1, createdAt: -1 });
export const Transaction = model('Transaction', transactionSchema);
