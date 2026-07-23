import { Model } from "mongoose";
import { MongoDbConnection } from "../connections/mongodb.connection";
import {
  NotificationLogSchemaType,
  notificationLogSchema,
} from "../schemas/notification-log.schema";

export class MongoNotificationLogRepository {
  private readonly modelName = "MongoNotificationLog";

  private getModel(): Model<NotificationLogSchemaType> {
    const connection = MongoDbConnection.getAppLogsConnection();
    const existing = connection.models[this.modelName] as
      | Model<NotificationLogSchemaType>
      | undefined;
    return (
      existing ??
      connection.model<NotificationLogSchemaType>(
        this.modelName,
        notificationLogSchema,
      )
    );
  }

  public async create(
    data: Omit<NotificationLogSchemaType, "createdAt">,
  ): Promise<void> {
    await this.getModel().create(data);
  }

  public async findByRecipient(
    to: string,
    limit = 20,
  ): Promise<NotificationLogSchemaType[]> {
    return this.getModel()
      .find({ to })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}
