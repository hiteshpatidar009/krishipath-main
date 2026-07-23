import { Schema } from "mongoose";
export const integrationLogSchema = new Schema({
    provider: { type: String, required: true, index: true },
    integrationName: { type: String, required: true, index: true },
    direction: { type: String, required: true },
    status: { type: String, required: true, index: true },
    companyId: { type: String, index: true },
    requestId: { type: String, index: true },
    endpoint: String,
    method: String,
    statusCode: Number,
    responseTimeMs: Number,
    requestPayload: Schema.Types.Mixed,
    responsePayload: Schema.Types.Mixed,
    errorMessage: String,
}, {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    collection: "platform_logs",
});
