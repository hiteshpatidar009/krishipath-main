import { Schema } from "mongoose";

export interface IntegrationLogSchemaType {
  provider: string;
  integrationName: string;
  direction: "inbound" | "outbound";
  status: "success" | "failed" | "retry";
  companyId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTimeMs?: number;
  requestPayload?: unknown;
  responsePayload?: unknown;
  errorMessage?: string;
  createdAt: Date;
}

export const integrationLogSchema = new Schema<IntegrationLogSchemaType>(
  {
    provider: { type: String, required: true, index: true },
    integrationName: { type: String, required: true, index: true },
    direction: { type: String, required: true },
    status: { type: String, required: true, index: true },
    companyId: { type: String, index: true },
    requestId: { type: String, index: true },
    endpoint: String,
    method: String,
    statusCode: Number,
    responseTimeMs: Number,
    requestPayload: Schema.Types.Mixed,
    responsePayload: Schema.Types.Mixed,
    errorMessage: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    collection: "platform_logs",
  },
);
