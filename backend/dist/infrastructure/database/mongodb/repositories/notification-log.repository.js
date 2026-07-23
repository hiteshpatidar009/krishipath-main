import { MongoDbConnection } from "../connections/mongodb.connection";
import { notificationLogSchema, } from "../schemas/notification-log.schema";
export class MongoNotificationLogRepository {
    modelName = "MongoNotificationLog";
    getModel() {
        const connection = MongoDbConnection.getAppLogsConnection();
        const existing = connection.models[this.modelName];
        return (existing ??
            connection.model(this.modelName, notificationLogSchema));
    }
    async create(data) {
        await this.getModel().create(data);
    }
    async findByRecipient(to, limit = 20) {
        return this.getModel()
            .find({ to })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    }
}
