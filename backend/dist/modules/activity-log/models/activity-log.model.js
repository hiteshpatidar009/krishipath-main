import { Schema } from "mongoose";
import { MongoDbConnection } from "../../../infrastructure/database/mongodb";
const schema = new Schema({
    companyId: { type: String, index: true },
    userId: { type: String, index: true },
    activityType: { type: String, required: true, index: true },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: String,
    userAgent: String,
    requestId: { type: String, index: true },
}, {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    collection: "user_activity_logs",
});
schema.index({ companyId: 1, createdAt: -1 });
schema.index({ userId: 1, createdAt: -1 });
export class ActivityLogModelFactory {
    static getModel() {
        const conn = MongoDbConnection.getAppLogsConnection();
        const existing = conn.models.ActivityLog;
        if (existing) {
            return existing;
        }
        return conn.model("ActivityLog", schema);
    }
}
