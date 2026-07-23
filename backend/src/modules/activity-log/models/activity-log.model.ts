import { Connection, Model, Schema } from "mongoose";
import { MongoDbConnection } from "../../../infrastructure/database/mongodb";

export interface ActivityLogDocument {
  companyId?: string;
  userId?: string;
  activityType: string;
  description: string;
  metadata?: unknown;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  createdAt: Date;
}

const schema = new Schema<ActivityLogDocument>(
  {
    companyId: { type: String, index: true },
    userId: { type: String, index: true },
    activityType: { type: String, required: true, index: true },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: String,
    userAgent: String,
    requestId: { type: String, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    collection: "user_activity_logs",
  },
);

schema.index({ companyId: 1, createdAt: -1 });
schema.index({ userId: 1, createdAt: -1 });

export class ActivityLogModelFactory {
  public static getModel(): Model<ActivityLogDocument> {
    const conn: Connection = MongoDbConnection.getAppLogsConnection();
    const existing = conn.models.ActivityLog as
      | Model<ActivityLogDocument>
      | undefined;

    if (existing) {
      return existing;
    }

    return conn.model<ActivityLogDocument>("ActivityLog", schema);
  }
}
