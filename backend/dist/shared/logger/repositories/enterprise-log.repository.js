import { MongoDbConnection } from "../../../infrastructure/database/mongodb";
import { EnterpriseLogModelFactory } from "../schemas/enterprise-log.schema";
import { LogRetentionPolicyService } from "../services/log-retention-policy.service";
export class EnterpriseLogRepository {
    static retentionInitialized = new Set();
    async create(collectionName, log) {
        if (!MongoDbConnection.hasAppLogsConnection()) {
            return;
        }
        const model = EnterpriseLogModelFactory.getModel(collectionName);
        await this.ensureRetentionIndex(collectionName);
        await model.create(log);
    }
    async countByCollection(collectionName) {
        if (!MongoDbConnection.hasAppLogsConnection()) {
            return 0;
        }
        return EnterpriseLogModelFactory.getModel(collectionName).countDocuments();
    }
    async list(collectionName, filter, limit, offset) {
        if (!MongoDbConnection.hasAppLogsConnection()) {
            return [];
        }
        return EnterpriseLogModelFactory.getModel(collectionName)
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .lean();
    }
    async latestAuditHash(companyId) {
        if (!MongoDbConnection.hasAppLogsConnection()) {
            return null;
        }
        const filter = companyId ? { companyId } : {};
        const [record] = await EnterpriseLogModelFactory.getModel("audit_logs")
            .find(filter)
            .sort({ createdAt: -1 })
            .limit(1)
            .lean();
        const chainHash = record?.metadata?.chainHash;
        return typeof chainHash === "string" ? chainHash : null;
    }
    async ensureRetentionIndex(collectionName) {
        if (EnterpriseLogRepository.retentionInitialized.has(collectionName)) {
            return;
        }
        const model = EnterpriseLogModelFactory.getModel(collectionName);
        await model.collection.createIndex({ createdAt: 1 }, {
            expireAfterSeconds: LogRetentionPolicyService.ttlSeconds(collectionName),
            name: `${collectionName}_retention_ttl`,
        });
        EnterpriseLogRepository.retentionInitialized.add(collectionName);
    }
}
