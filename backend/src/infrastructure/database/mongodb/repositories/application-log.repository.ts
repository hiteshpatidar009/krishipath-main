import { Model } from "mongoose";
import { MongoDbConnection } from "../connections/mongodb.connection";
import {
  ApplicationLogSchemaType,
  applicationLogSchema,
} from "../schemas/application-log.schema";

export class MongoApplicationLogRepository {
  private readonly modelName = "MongoApplicationLog";

  private getModel(): Model<ApplicationLogSchemaType> {
    const connection = MongoDbConnection.getAppLogsConnection();
    const existing = connection.models[this.modelName] as
      | Model<ApplicationLogSchemaType>
      | undefined;
    return (
      existing ??
      connection.model<ApplicationLogSchemaType>(
        this.modelName,
        applicationLogSchema,
      )
    );
  }

  public async create(data: Omit<ApplicationLogSchemaType, "createdAt">): Promise<void> {
    await this.getModel().create(data);
  }
}
