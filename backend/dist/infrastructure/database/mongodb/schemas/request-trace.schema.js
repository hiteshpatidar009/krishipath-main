import { Schema } from "mongoose";
export const requestTraceSchema = new Schema({
    requestId: { type: String, required: true, unique: true, index: true },
    companyId: { type: String, index: true },
    userId: { type: String, index: true },
    method: { type: String, required: true },
    route: { type: String, required: true },
    ipAddress: String,
    userAgent: String,
    requestHeaders: Schema.Types.Mixed,
    requestBody: Schema.Types.Mixed,
    responseCode: { type: Number, required: true },
    responseBody: Schema.Types.Mixed,
    latencyMs: { type: Number, required: true },
}, {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    collection: "platform_logs",
});
