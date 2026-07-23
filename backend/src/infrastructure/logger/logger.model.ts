import { Document, Model, Schema } from "mongoose";

import { MongoDbConnection } from "../database/mongodb";
import { LoggerConstants } from "./logger.constants";
import { LogLevel } from "./logger.types";

export interface LogDocument extends Document {
  level: LogLevel;
  message: string;
  stack?: string;
  errorName?: string;
  fileName?: string;
  functionName?: string;
  lineNumber?: number;
  columnNumber?: number;
  companyId?: string;
  userId?: string;
  module?: string;
  method?: string;
  route?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  payload?: unknown;
  response?: unknown;
  headers?: Record<string, unknown>;
  tags?: string[];
  createdAt: Date;
}

const logSchema: Schema<LogDocument> = new Schema(
  {
    level: {
      type: String,
      required: true,
      enum: [
        LoggerConstants.LEVEL_INFO,
        LoggerConstants.LEVEL_WARN,
        LoggerConstants.LEVEL_ERROR,
        LoggerConstants.LEVEL_DEBUG,
        LoggerConstants.LEVEL_FATAL,
      ],
    },
    message: {
      type: String,
      required: true,
      maxlength: LoggerConstants.MAX_MESSAGE_LENGTH,
    },
    stack: {
      type: String,
      maxlength: LoggerConstants.MAX_STACK_LENGTH,
    },
    errorName: String,
    fileName: String,
    functionName: String,
    lineNumber: Number,
    columnNumber: Number,
    companyId: { type: String, index: true },
    userId: { type: String, index: true },
    module: { type: String, index: true },
    method: String,
    route: String,
    requestId: String,
    ipAddress: String,
    userAgent: String,
    payload: Schema.Types.Mixed,
    response: Schema.Types.Mixed,
    headers: Schema.Types.Mixed,
    tags: {
      type: [String],
      default: LoggerConstants.DEFAULT_TAGS,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    collection: LoggerConstants.COLLECTION_NAME,
  },
);

logSchema.index({ createdAt: -1 });
logSchema.index({ level: 1, createdAt: -1 });
logSchema.index({ module: 1, createdAt: -1 });
logSchema.index({ companyId: 1, createdAt: -1 });
logSchema.index({ userId: 1, createdAt: -1 });

export class LogModelFactory {
  public static getModel(): Model<LogDocument> {
    const appLogsConnection = MongoDbConnection.getAppLogsConnection();
    const existing = appLogsConnection.models.ApplicationLog as
      | Model<LogDocument>
      | undefined;

    if (existing) {
      return existing;
    }

    return appLogsConnection.model<LogDocument>("ApplicationLog", logSchema);
  }
}
