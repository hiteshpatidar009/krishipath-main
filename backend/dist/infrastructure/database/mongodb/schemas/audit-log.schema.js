import { Schema } from "mongoose";
export const auditLogSchema = new Schema({
    companyId: { type: String, index: true },
    actorUserId: { type: String, index: true },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: String, index: true },
    requestId: { type: String, index: true },
    ipAddress: String,
    userAgent: String,
    previousHash: String,
    payloadHash: { type: String, required: true },
    chainHash: { type: String, required: true, index: true },
    metadata: Schema.Types.Mixed,
}, {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    collection: "audit_logs",
});
