import { Schema } from "mongoose";
export const otpLogSchema = new Schema({
    challengeId: { type: String, required: true, index: true },
    target: { type: String, required: true, index: true },
    code: { type: String, required: true },
    purpose: { type: String, required: true },
    method: { type: String, required: true },
    expiresAt: { type: Date, required: true },
}, {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    collection: "otps", // Save in 'otps' instead of 'otp_logs'
});
// TTL index to automatically delete expired OTPs from the database
otpLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
