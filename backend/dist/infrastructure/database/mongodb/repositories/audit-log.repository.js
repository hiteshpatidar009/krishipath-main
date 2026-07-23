import { MongoDbConnection } from "../connections/mongodb.connection";
import { auditLogSchema, } from "../schemas/audit-log.schema";
export class MongoAuditLogRepository {
    modelName = "MongoAuditLog";
    getModel() {
        const connection = MongoDbConnection.getAppLogsConnection();
        const existing = connection.models[this.modelName];
        return (existing ??
            connection.model(this.modelName, auditLogSchema));
    }
    async create(data) {
        await this.getModel().create(data);
    }
}
