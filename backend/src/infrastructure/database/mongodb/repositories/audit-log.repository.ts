import { Model } from "mongoose";
import { MongoDbConnection } from "../connections/mongodb.connection";
import {
  AuditLogSchemaType,
  auditLogSchema,
} from "../schemas/audit-log.schema";

export class MongoAuditLogRepository {
  private readonly modelName = "MongoAuditLog";

  private getModel(): Model<AuditLogSchemaType> {
    const connection = MongoDbConnection.getAppLogsConnection();
    const existing = connection.models[this.modelName] as
      | Model<AuditLogSchemaType>
      | undefined;
    return (
      existing ??
      connection.model<AuditLogSchemaType>(this.modelName, auditLogSchema)
    );
  }

  public async create(
    data: Omit<AuditLogSchemaType, "createdAt">,
  ): Promise<void> {
    await this.getModel().create(data);
  }
}
