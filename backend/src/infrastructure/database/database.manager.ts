import { DATABASE_CONNECTION_NAMES } from "./database.constants";
import {
  IDatabaseConnection,
  ManagedDatabaseConnection,
} from "./database.types";
import { Db1Connection } from "./postgres/connections/db1.connection";
import { MongoDbConnection } from "./mongodb/connections/mongodb.connection";
import { RedisConnection } from "./redis/redis.connection";
import { logger } from "../logger/logger.service";
import { ConsoleTagLogger } from "../logger/console-tag.logger";

class DbConnAdapter implements IDatabaseConnection {
  private initialized: boolean;
  private readonly init?: () => void;
  private readonly onConnect: () => Promise<void>;
  private readonly onDisconnect: () => Promise<void>;

  constructor(
    onConnect: () => Promise<void>,
    onDisconnect: () => Promise<void>,
    init?: () => void,
  ) {
    this.initialized = false;
    this.init = init;
    this.onConnect = onConnect;
    this.onDisconnect = onDisconnect;
  }

  public async connect(): Promise<void> {
    if (!this.initialized) {
      this.init?.();
      this.initialized = true;
    }

    await this.onConnect();
  }

  public async disconnect(): Promise<void> {
    await this.onDisconnect();
  }
}

class DbConnFactory {
  public createAll(): ReadonlyArray<ManagedDatabaseConnection> {
    return [
      {
        name: "mongodb",
        // MongoDB stores operational/audit logs. Core farmer and mandi data is
        // in Postgres, so a logging outage must not take the mobile API down.
        optional: true,
        connection: new DbConnAdapter(
          () => MongoDbConnection.connect(),
          () => MongoDbConnection.disconnect(),
        ),
      },
      {
        name: "redis",
        connection: new DbConnAdapter(
          () => RedisConnection.connect(),
          () => RedisConnection.disconnect(),
          () => {
            RedisConnection.getInstance();
          },
        ),
      },
      {
        name: "db1",
        connection: new DbConnAdapter(
          () => Db1Connection.connect(),
          () => Db1Connection.disconnect(),
          () => {
            Db1Connection.getInstance();
          },
        ),
      },
    ];
  }
}

export class DatabaseManager {
  private isConnected: boolean;
  private readonly connections: ReadonlyArray<ManagedDatabaseConnection>;

  constructor(connections: ReadonlyArray<ManagedDatabaseConnection>) {
    this.isConnected = false;
    this.connections = connections;
  }

  public async connectAll(): Promise<void> {
    if (this.isConnected) {
      await logger.warn("Database connect skipped. Already connected", {
        module: "database.manager",
        tags: ["database", "manager", "connect", "skipped"],
      });
      return;
    }

    const connectedConnections: ManagedDatabaseConnection[] = [];
    const failedConnections: string[] = [];

    try {
      for (const managedConnection of this.connections) {
        try {
          const connectionLabel =
            DATABASE_CONNECTION_NAMES[managedConnection.name];
          
          ConsoleTagLogger.info("DATABASE", `Connecting ${connectionLabel}...`);
          
          await managedConnection.connection.connect();
          
          ConsoleTagLogger.info("DATABASE", `${connectionLabel} connected successfully`);
          await logger.info(`${connectionLabel} connected successfully`, {
            module: "database.manager",
            tags: ["database", "manager", "connect", managedConnection.name, "ok"],
          });
          
          connectedConnections.push(managedConnection);
        } catch (error: unknown) {
          const connectionLabel =
            DATABASE_CONNECTION_NAMES[managedConnection.name];
          const normalizedError =
            error instanceof Error ? error : (
              new Error(`Failed to connect ${connectionLabel}`)
            );

          ConsoleTagLogger.error("DATABASE", `${connectionLabel} connection failed: ${normalizedError.message}`);
          
          await logger.error(normalizedError, {
            module: "database.manager",
            tags: [
              "database",
              "manager",
              "connect",
              "failed",
              managedConnection.name,
            ],
          });

          if (managedConnection.optional) {
            ConsoleTagLogger.warn(
              "DATABASE",
              `${connectionLabel} is optional; continuing without it`,
            );
          } else {
            failedConnections.push(connectionLabel);
          }
        }
      }

      if (failedConnections.length > 0) {
        const failedList = failedConnections.join(", ");
        const startupError = new Error(`Database startup failed: ${failedList}`);

        ConsoleTagLogger.error("DATABASE", startupError.message);
        await logger.error(startupError, {
          module: "database.manager",
          tags: ["database", "manager", "connect", "failed"],
        });

        await this.rollbackConnectedDatabases(connectedConnections);
        this.isConnected = false;
        throw startupError;
      }

      this.isConnected = true;

      ConsoleTagLogger.info("DATABASE", `Successfully connected to ${connectedConnections.length} database(s)`);
      await logger.info(`Successfully connected to ${connectedConnections.length} database(s)`, {
        module: "database.manager",
        tags: ["database", "manager", "connect", "done"],
      });
    } catch (error: unknown) {
      await this.rollbackConnectedDatabases(connectedConnections);
      this.isConnected = false;
      throw error;
    }
  }

  public async disconnectAll(): Promise<void> {
    ConsoleTagLogger.info("DATABASE", "Disconnecting all databases...");
    await logger.info("Disconnecting all databases...", {
      module: "database.manager",
      tags: ["database", "manager", "disconnect", "start"],
    });

    const disconnectResults = await Promise.allSettled(
      this.connections.map((managedConnection) =>
        managedConnection.connection.disconnect(),
      ),
    );

    for (let index = 0; index < disconnectResults.length; index++) {
      const result = disconnectResults[index];
      const managedConnection = this.connections[index];

      if (result.status === "rejected") {
        const connectionLabel =
          DATABASE_CONNECTION_NAMES[managedConnection.name];
        const normalizedError =
          result.reason instanceof Error ?
            result.reason
          : new Error(String(result.reason));

        ConsoleTagLogger.error("DATABASE", `Failed to disconnect ${connectionLabel}:`, result.reason);
        await logger.error(normalizedError, {
          module: "database.manager",
          tags: [
            "database",
            "manager",
            "disconnect",
            "failed",
            managedConnection.name,
          ],
        });
      } else {
        const connectionLabel =
          DATABASE_CONNECTION_NAMES[managedConnection.name];
        ConsoleTagLogger.info("DATABASE", `${connectionLabel} disconnected successfully`);
        await logger.info(`${connectionLabel} disconnected successfully`, {
          module: "database.manager",
          tags: ["database", "manager", "disconnect", managedConnection.name, "ok"],
        });
      }
    }

    this.isConnected = false;
    ConsoleTagLogger.info("DATABASE", "All databases disconnected successfully");
    await logger.info("All databases disconnected successfully", {
      module: "database.manager",
      tags: ["database", "manager", "disconnect", "done"],
    });
  }

  private async rollbackConnectedDatabases(
    connectedConnections: ManagedDatabaseConnection[],
  ): Promise<void> {
    const rollbackConnections = [...connectedConnections].reverse();
    const rollbackResults = await Promise.allSettled(
      rollbackConnections.map((managedConnection) =>
        managedConnection.connection.disconnect(),
      ),
    );

    for (let index = 0; index < rollbackResults.length; index++) {
      const rollbackResult = rollbackResults[index];
      const managedConnection = rollbackConnections[index];

      if (rollbackResult.status === "rejected") {
        const connectionLabel =
          DATABASE_CONNECTION_NAMES[managedConnection.name];
        const normalizedError =
          rollbackResult.reason instanceof Error ?
            rollbackResult.reason
          : new Error(String(rollbackResult.reason));

        ConsoleTagLogger.error("DATABASE", `Rollback failed for ${connectionLabel}:`, rollbackResult.reason);
        await logger.error(normalizedError, {
          module: "database.manager",
          tags: [
            "database",
            "manager",
            "rollback",
            "failed",
            managedConnection.name,
          ],
        });
      }
    }
  }
}

const connFactory = new DbConnFactory();

export const databaseManager = new DatabaseManager(connFactory.createAll());
