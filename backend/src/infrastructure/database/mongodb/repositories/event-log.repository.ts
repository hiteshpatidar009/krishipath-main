import { Model } from "mongoose";
import { MongoDbConnection } from "../connections/mongodb.connection";
import { EventLogSchemaType, eventLogSchema } from "../schemas/event-log.schema";

export class MongoEventLogRepository {
  private readonly modelName = "MongoEventLog";

  private getModel(): Model<EventLogSchemaType> {
    const connection = MongoDbConnection.getAppLogsConnection();
    const existing = connection.models[this.modelName] as
      | Model<EventLogSchemaType>
      | undefined;
    return existing ?? connection.model<EventLogSchemaType>(this.modelName, eventLogSchema);
  }

  public async create(data: Omit<EventLogSchemaType, "createdAt">): Promise<void> {
    await this.getModel().create(data);
  }
}
