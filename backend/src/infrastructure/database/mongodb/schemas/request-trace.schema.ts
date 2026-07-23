import { Schema } from "mongoose";

export interface RequestTraceSchemaType {
  requestId: string;
  companyId?: string;
  userId?: string;
  method: string;
  route: string;
  ipAddress?: string;
  userAgent?: string;
  requestHeaders?: unknown;
  requestBody?: unknown;
  responseCode: number;
  responseBody?: unknown;
  latencyMs: number;
  createdAt: Date;
}

export const requestTraceSchema = new Schema<RequestTraceSchemaType>(
  {
    requestId: { type: String, required: true, unique: true, index: true },
    companyId: { type: String, index: true },
    userId: { type: String, index: true },
    method: { type: String, required: true },
    route: { type: String, required: true },
    ipAddress: String,
    userAgent: String,
    requestHeaders: Schema.Types.Mixed,
    requestBody: Schema.Types.Mixed,
    responseCode: { type: Number, required: true },
    responseBody: Schema.Types.Mixed,
    latencyMs: { type: Number, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    collection: "platform_logs",
  },
);
