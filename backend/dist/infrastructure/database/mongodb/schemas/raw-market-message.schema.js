import { Schema } from "mongoose";
export const RawMarketMessageSchema = new Schema({
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
}, {
    timestamps: true,
    collection: "messages",
    strict: false, // allow legacy fields to come through
});
import { MongoDbConnection } from "../connections/mongodb.connection";
export function getRawMarketMessageModel() {
    const connection = MongoDbConnection.getActivitiesConnection();
    const modelName = "RawMarketMessage";
    const existing = connection.models[modelName];
    return existing ?? connection.model(modelName, RawMarketMessageSchema);
}
