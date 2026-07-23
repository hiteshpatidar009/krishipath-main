import { Model } from "mongoose";
import { MongoDbConnection } from "../connections/mongodb.connection";
import {
  OtpLogSchemaType,
  otpLogSchema,
} from "../schemas/otp-log.schema";

export class MongoOtpLogRepository {
  private readonly modelName = "MongoOtpLog";

  private getModel(): Model<OtpLogSchemaType> {
    const connection = MongoDbConnection.getAppLogsConnection();
    const existing = connection.models[this.modelName] as
      | Model<OtpLogSchemaType>
      | undefined;
    return (
      existing ??
      connection.model<OtpLogSchemaType>(this.modelName, otpLogSchema)
    );
  }

  public async create(
    data: Omit<OtpLogSchemaType, "createdAt">,
  ): Promise<void> {
    await this.getModel().create(data);
  }

  public async deleteByTargetAndCode(target: string, code: string): Promise<void> {
    await this.getModel().deleteMany({ target, code });
  }
}
