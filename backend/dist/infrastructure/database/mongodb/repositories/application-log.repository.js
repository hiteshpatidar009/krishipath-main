import { MongoDbConnection } from "../connections/mongodb.connection";
import { applicationLogSchema, } from "../schemas/application-log.schema";
export class MongoApplicationLogRepository {
    modelName = "MongoApplicationLog";
    getModel() {
        const connection = MongoDbConnection.getAppLogsConnection();
        const existing = connection.models[this.modelName];
        return (existing ??
            connection.model(this.modelName, applicationLogSchema));
    }
    async create(data) {
        await this.getModel().create(data);
    }
}
