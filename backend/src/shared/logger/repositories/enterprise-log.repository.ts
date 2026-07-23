import { MongoDbConnection } from "../../../infrastructure/database/mongodb";
import { EnterpriseLogModelFactory } from "../schemas/enterprise-log.schema";
import { LogRetentionPolicyService } from "../services/log-retention-policy.service";
import { EnterpriseLogDocument, LogCollectionName } from "../types/enterprise-log.types";

export class EnterpriseLogRepository {
  private static readonly retentionInitialized = new Set<LogCollectionName>();

  public async create(collectionName: LogCollectionName, log: EnterpriseLogDocument): Promise<void> {
    if (!MongoDbConnection.hasAppLogsConnection()) {
      return;
    }

    const model = EnterpriseLogModelFactory.getModel(collectionName);
    await this.ensureRetentionIndex(collectionName);
    await model.create(log);
  }

  public async countByCollection(collectionName: LogCollectionName): Promise<number> {
    if (!MongoDbConnection.hasAppLogsConnection()) {
      return 0;
    }

    return EnterpriseLogModelFactory.getModel(collectionName).countDocuments();
  }

  public async list(
    collectionName: LogCollectionName,
    filter: Record<string, unknown>,
    limit: number,
    offset: number,
  ): Promise<EnterpriseLogDocument[]> {
    if (!MongoDbConnection.hasAppLogsConnection()) {
      return [];
    }

    return EnterpriseLogModelFactory.getModel(collectionName)
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean<EnterpriseLogDocument[]>();
  }

  public async latestAuditHash(companyId?: string): Promise<string | null> {
    if (!MongoDbConnection.hasAppLogsConnection()) {
      return null;
    }

    const filter = companyId ? { companyId } : {};
    const [record] = await EnterpriseLogModelFactory.getModel("audit_logs")
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(1)
      .lean<EnterpriseLogDocument[]>();
    const chainHash = record?.metadata?.chainHash;
    return typeof chainHash === "string" ? chainHash : null;
  }

  private async ensureRetentionIndex(collectionName: LogCollectionName): Promise<void> {
    if (EnterpriseLogRepository.retentionInitialized.has(collectionName)) {
      return;
    }

    const model = EnterpriseLogModelFactory.getModel(collectionName);
    await model.collection.createIndex(
      { createdAt: 1 },
      {
        expireAfterSeconds: LogRetentionPolicyService.ttlSeconds(collectionName),
        name: `${collectionName}_retention_ttl`,
      },
    );
    EnterpriseLogRepository.retentionInitialized.add(collectionName);
  }
}
