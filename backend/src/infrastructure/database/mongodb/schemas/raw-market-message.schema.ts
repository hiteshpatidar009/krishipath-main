import { Schema, Document, model } from "mongoose";

export interface IRawMarketMessage extends Document {
  messageId: string;
  marketSourceId?: string; // Postgres Market Source ID, populated later or at creation
  whatsappGroupId?: string; // WhatsApp Group ID if applicable
  groupName?: string;
  sender: string; // E.164 format WhatsApp number
  timestamp: Date;
  rawMessage: any; // The raw JSON payload from Baileys
  aiVersion?: string;
  parserVersion?: string;
  aiConfidence?: number;
  reviewStatus: "PENDING" | "APPROVED" | "REJECTED";
  approvalStatus: "PENDING" | "SAVED" | "DISCARDED";
  extractedData?: any; // The structured JSON data extracted by AI
  groupId?: string;
  text?: string;
  senderName?: string;
  messageType?: string;
  isParsed?: boolean;
  aiStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const RawMarketMessageSchema = new Schema<IRawMarketMessage>(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    marketSourceId: {
      type: String,
      index: true,
    },
    whatsappGroupId: {
      type: String,
      index: true,
    },
    groupName: {
      type: String,
    },
    sender: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    rawMessage: {
      type: Schema.Types.Mixed,
      required: true,
    },
    aiVersion: String,
    parserVersion: String,
    aiConfidence: Number,
    reviewStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    approvalStatus: {
      type: String,
      enum: ["PENDING", "SAVED", "DISCARDED"],
      default: "PENDING",
    },
    extractedData: Schema.Types.Mixed,
    groupId: String,
    text: String,
    senderName: String,
    messageType: String,
    isParsed: Boolean,
    aiStatus: String,
  },
  {
    timestamps: true,
    collection: "messages",
    strict: false, // allow legacy fields to come through
  }
);

import { MongoDbConnection } from "../connections/mongodb.connection";

export function getRawMarketMessageModel() {
  const connection = MongoDbConnection.getActivitiesConnection();
  const modelName = "RawMarketMessage";
  const existing = connection.models[modelName];
  return existing ?? connection.model<IRawMarketMessage>(modelName, RawMarketMessageSchema);
}
