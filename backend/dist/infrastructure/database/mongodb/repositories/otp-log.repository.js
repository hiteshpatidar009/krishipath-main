import { MongoDbConnection } from "../connections/mongodb.connection";
import { otpLogSchema, } from "../schemas/otp-log.schema";
export class MongoOtpLogRepository {
    modelName = "MongoOtpLog";
    getModel() {
        const connection = MongoDbConnection.getAppLogsConnection();
        const existing = connection.models[this.modelName];
        return (existing ??
            connection.model(this.modelName, otpLogSchema));
    }
    async create(data) {
        await this.getModel().create(data);
    }
    async deleteByTargetAndCode(target, code) {
        await this.getModel().deleteMany({ target, code });
    }
}
