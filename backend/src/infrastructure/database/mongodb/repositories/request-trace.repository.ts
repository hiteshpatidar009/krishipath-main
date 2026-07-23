import { Model } from "mongoose";
import { MongoDbConnection } from "../connections/mongodb.connection";
import {
  RequestTraceSchemaType,
  requestTraceSchema,
} from "../schemas/request-trace.schema";

export class MongoRequestTraceRepository {
  private readonly modelName = "MongoRequestTrace";

  private getModel(): Model<RequestTraceSchemaType> {
    const connection = MongoDbConnection.getAppLogsConnection();
    const existing = connection.models[this.modelName] as
      | Model<RequestTraceSchemaType>
      | undefined;
    return (
      existing ??
      connection.model<RequestTraceSchemaType>(this.modelName, requestTraceSchema)
    );
  }

  public async create(data: Omit<RequestTraceSchemaType, "createdAt">): Promise<void> {
    await this.getModel().create(data);
  }
}
