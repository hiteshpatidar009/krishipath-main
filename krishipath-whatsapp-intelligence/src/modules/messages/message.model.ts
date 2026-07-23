import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  messageId: string;

  groupId: string;

  sender: string;

  senderName: string;

  messageType: string;

  text: string;

  rawMessage: object;

  isParsed: boolean;

  aiStatus: string;

  createdAt: Date;

  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    messageId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    groupId: {
      type: String,
      required: true,
      index: true,
    },

    sender: String,

    senderName: String,

    messageType: {
      type: String,
      default: "text",
    },

    text: String,

    rawMessage: {
      type: Schema.Types.Mixed,
    },

    isParsed: {
      type: Boolean,
      default: false,
    },

    aiStatus: {
      type: String,
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMessage>("Message", MessageSchema);