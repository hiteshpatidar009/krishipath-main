import mongoose from "mongoose";
import { env } from "../../../config/env";
import { ConsoleTagLogger } from "../../../logger/console-tag.logger";
export class MongoDbConnection {
    static appLogsConnection = null;
    static activitiesConnection = null;
    static async connect() {
        ConsoleTagLogger.info("MONGODB", "Connecting to MongoDB...");
        if (!MongoDbConnection.appLogsConnection) {
            try {
                MongoDbConnection.appLogsConnection = await mongoose
                    .createConnection(env.mongoDbUrl, {
                    dbName: env.mongoAppLogsDb,
                    maxPoolSize: 20,
                    minPoolSize: 5,
                    serverSelectionTimeoutMS: 10000,
                    socketTimeoutMS: 45000,
                })
                    .asPromise();
                ConsoleTagLogger.info("MONGODB", "App logs connection established");
            }
            catch (error) {
                MongoDbConnection.appLogsConnection = null;
                ConsoleTagLogger.error("MONGODB", "Failed to create app logs connection:", error);
                throw error;
            }
        }
        if (!MongoDbConnection.activitiesConnection) {
            try {
                MongoDbConnection.activitiesConnection = await mongoose
                    .createConnection(env.mongoDbUrl, {
                    dbName: env.mongoActivitiesDb,
                    maxPoolSize: 20,
                    minPoolSize: 5,
                    serverSelectionTimeoutMS: 10000,
                    socketTimeoutMS: 45000,
                })
                    .asPromise();
                ConsoleTagLogger.info("MONGODB", "Activities connection established");
            }
            catch (error) {
                ConsoleTagLogger.error("MONGODB", "Failed to create activities connection:", error);
                // Do not leave the first connection open when the pair cannot be
                // initialized. The database manager may continue in degraded mode.
                await MongoDbConnection.disconnect();
                throw error;
            }
        }
        ConsoleTagLogger.info("MONGODB", "All connections established successfully");
    }
    static getAppLogsConnection() {
        if (!MongoDbConnection.appLogsConnection) {
            throw new Error("Mongo app logs connection not initialized");
        }
        return MongoDbConnection.appLogsConnection;
    }
    static hasAppLogsConnection() {
        return Boolean(MongoDbConnection.appLogsConnection);
    }
    static getActivitiesConnection() {
        if (!MongoDbConnection.activitiesConnection) {
            throw new Error("Mongo activities connection not initialized");
        }
        return MongoDbConnection.activitiesConnection;
    }
    static hasActivitiesConnection() {
        return Boolean(MongoDbConnection.activitiesConnection);
    }
    static async disconnect() {
        ConsoleTagLogger.info("MONGODB", "Disconnecting from MongoDB...");
        await Promise.all([
            MongoDbConnection.appLogsConnection?.close(),
            MongoDbConnection.activitiesConnection?.close(),
        ]);
        MongoDbConnection.appLogsConnection = null;
        MongoDbConnection.activitiesConnection = null;
        ConsoleTagLogger.info("MONGODB", "Disconnected successfully");
    }
}
