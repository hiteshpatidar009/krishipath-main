import { MongoDbConnection } from "../connections/mongodb.connection";
import { requestTraceSchema, } from "../schemas/request-trace.schema";
export class MongoRequestTraceRepository {
    modelName = "MongoRequestTrace";
    getModel() {
        const connection = MongoDbConnection.getAppLogsConnection();
        const existing = connection.models[this.modelName];
        return (existing ??
            connection.model(this.modelName, requestTraceSchema));
    }
    async create(data) {
        await this.getModel().create(data);
    }
}
