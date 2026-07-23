import { Schema } from "mongoose";
export const applicationLogSchema = new Schema({
    level: { type: String, required: true, index: true },
    message: { type: String, required: true },
    stack: String,
    errorName: String,
    module: { type: String, index: true },
    method: String,
    route: String,
    requestId: { type: String, index: true },
    companyId: { type: String, index: true },
    userId: { type: String, index: true },
    ipAddress: String,
    userAgent: String,
    payload: Schema.Types.Mixed,
    response: Schema.Types.Mixed,
    tags: { type: [String], default: [] },
}, {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    collection: "platform_logs",
});
