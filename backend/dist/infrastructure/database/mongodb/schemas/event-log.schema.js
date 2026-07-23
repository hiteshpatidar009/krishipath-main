import { Schema } from "mongoose";
export const eventLogSchema = new Schema({
    eventName: { type: String, required: true, index: true },
    eventType: { type: String, required: true, index: true },
    aggregateType: String,
    aggregateId: String,
    companyId: { type: String, index: true },
    userId: { type: String, index: true },
    requestId: { type: String, index: true },
    payload: Schema.Types.Mixed,
    status: { type: String, required: true, default: "pending", index: true },
    retryCount: { type: Number, required: true, default: 0 },
    publishedAt: Date,
}, {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    collection: "platform_logs",
});
