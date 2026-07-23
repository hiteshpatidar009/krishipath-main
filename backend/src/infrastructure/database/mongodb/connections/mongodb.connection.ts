import mongoose, { Connection } from "mongoose";

import { env } from "../../../config/env";
import { ConsoleTagLogger } from "../../../logger/console-tag.logger";

export class MongoDbConnection {
  private static appLogsConnection: Connection | null = null;
  private static activitiesConnection: Connection | null = null;

  public static async connect(): Promise<void> {
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
      } catch (error) {
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
      } catch (error) {
        ConsoleTagLogger.error("MONGODB", "Failed to create activities connection:", error);
        // Do not leave the first connection open when the pair cannot be
        // initialized. The database manager may continue in degraded mode.
        await MongoDbConnection.disconnect();
        throw error;
      }
    }
    
    ConsoleTagLogger.info("MONGODB", "All connections established successfully");
  }

  public static getAppLogsConnection(): Connection {
    if (!MongoDbConnection.appLogsConnection) {
      throw new Error("Mongo app logs connection not initialized");
    }

    return MongoDbConnection.appLogsConnection;
  }

  public static hasAppLogsConnection(): boolean {
    return Boolean(MongoDbConnection.appLogsConnection);
  }

  public static getActivitiesConnection(): Connection {
    if (!MongoDbConnection.activitiesConnection) {
      throw new Error("Mongo activities connection not initialized");
    }

    return MongoDbConnection.activitiesConnection;
  }

  public static hasActivitiesConnection(): boolean {
    return Boolean(MongoDbConnection.activitiesConnection);
  }

  public static async disconnect(): Promise<void> {
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
