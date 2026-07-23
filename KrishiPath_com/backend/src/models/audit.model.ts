import { Schema, model } from 'mongoose';
const auditSchema = new Schema({ company: { type: Schema.Types.ObjectId, ref: 'Company', index: true }, actor: { type: Schema.Types.ObjectId, ref: 'User' }, action: { type: String, required: true, index: true }, entityType: String, entityId: String, before: Schema.Types.Mixed, after: Schema.Types.Mixed, ipAddress: String, userAgent: String, requestId: String }, { timestamps: true });
auditSchema.index({ company: 1, createdAt: -1 });
export const AuditLog = model('AuditLog', auditSchema);
