import { Schema } from "mongoose";

export interface NotificationLogSchemaType {
  type: "sms" | "email" | "whatsapp";
  to: string;
  message?: string;
  subject?: string;
  htmlBody?: string;
  channel: string;
  status: "sent" | "simulated" | "failed";
  provider: string;
  messageId?: string;
  companyId?: string;
  userId?: string;
  errorMessage?: string;
  createdAt: Date;
}

export const notificationLogSchema = new Schema<NotificationLogSchemaType>(
  {
    type: { type: String, required: true, index: true },
    to: { type: String, required: true, index: true },
    message: { type: String },
    subject: { type: String },
    htmlBody: { type: String },
    channel: { type: String, required: true },
    status: { type: String, required: true, index: true },
    provider: { type: String, required: true },
    messageId: { type: String },
    companyId: { type: String, index: true },
    userId: { type: String, index: true },
    errorMessage: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    collection: "notification_logs",
  },
);
