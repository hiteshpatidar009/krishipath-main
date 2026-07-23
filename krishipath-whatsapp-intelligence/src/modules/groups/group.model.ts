import mongoose, { Schema, Document } from "mongoose";

export interface IGroup extends Document {
  groupId: string;
  groupName: string;
  traderName: string;
  city?: string;
  district?: string;
  state?: string;

  participantsCount: number;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    groupId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    groupName: {
      type: String,
      required: true,
    },

    traderName: {
      type: String,
      default: "",
    },

    city: String,

    district: String,

    state: String,

    participantsCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IGroup>("Group", GroupSchema);