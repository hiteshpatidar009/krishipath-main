import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
  publicId: { type: String, required: true, unique: true }, company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  category: { type: String, enum: ['campaign', 'wallet', 'leads', 'system'], required: true, index: true },
  title: { type: String, required: true }, message: { type: String, required: true }, link: String,
  read: { type: Boolean, default: false, index: true }, readAt: Date,
  expiresAt: { type: Date, index: { expires: 0 } },
}, { timestamps: true });
notificationSchema.index({ company: 1, user: 1, createdAt: -1 });
export const Notification = model('Notification', notificationSchema);
