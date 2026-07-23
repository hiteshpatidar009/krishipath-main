import { MongoDbConnection } from "../connections/mongodb.connection";
import { eventLogSchema } from "../schemas/event-log.schema";
export class MongoEventLogRepository {
    modelName = "MongoEventLog";
    getModel() {
        const connection = MongoDbConnection.getAppLogsConnection();
        const existing = connection.models[this.modelName];
        return existing ?? connection.model(this.modelName, eventLogSchema);
    }
    async create(data) {
        await this.getModel().create(data);
    }
}
