import { Schema } from "mongoose";
import { MongoDbConnection } from "../../../infrastructure/database/mongodb";
const enterpriseLogSchema = new Schema({
    logId: { type: String, required: true, index: true, immutable: true },
    category: { type: String, required: true, index: true, immutable: true },
    severity: { type: String, required: true, index: true, immutable: true },
    module: { type: String, index: true, immutable: true },
    action: { type: String, index: true, immutable: true },
    message: { type: String, required: true, immutable: true },
    companyId: { type: String, index: true, immutable: true },
    organizationId: { type: String, index: true, immutable: true },
    warehouseId: { type: String, index: true, immutable: true },
    userId: { type: String, index: true, immutable: true },
    actorId: { type: String, index: true, immutable: true },
    status: { type: String, index: true, immutable: true },
    traceId: { type: String, index: true, immutable: true },
    correlationId: { type: String, index: true, immutable: true },
    requestId: { type: String, index: true, immutable: true },
    ipAddress: { type: String, immutable: true },
    deviceFingerprint: { type: String, immutable: true },
    executionDuration: { type: Number, immutable: true },
    metadata: { type: Schema.Types.Mixed, default: {}, immutable: true },
    createdAt: { type: Date, required: true, index: true, immutable: true },
}, {
    versionKey: false,
    collection: "platform_logs",
});
enterpriseLogSchema.index({ module: 1, createdAt: -1 });
enterpriseLogSchema.index({ category: 1, severity: 1, createdAt: -1 });
enterpriseLogSchema.index({ companyId: 1, createdAt: -1 });
enterpriseLogSchema.index({ traceId: 1, correlationId: 1, requestId: 1 });
export class EnterpriseLogModelFactory {
    static getModel(collectionName) {
        const connection = MongoDbConnection.getAppLogsConnection();
        const modelName = `Enterprise${collectionName
            .split("_")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join("")}`;
        const existing = connection.models[modelName];
        if (existing) {
            return existing;
        }
        return connection.model(modelName, enterpriseLogSchema.clone(), collectionName);
    }
}
