import { Schema } from "mongoose";
export const notificationLogSchema = new Schema({
    type: { type: String, required: true, index: true },
    to: { type: String, required: true, index: true },
    message: { type: String },
    subject: { type: String },
    htmlBody: { type: String },
    channel: { type: String, required: true },
    status: { type: String, required: true, index: true },
    provider: { type: String, required: true },
    messageId: { type: String },
    companyId: { type: String, index: true },
    userId: { type: String, index: true },
    errorMessage: { type: String },
}, {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    collection: "notification_logs",
});
