import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, PoolConfig } from "pg";

import { DatabaseConstants } from "../database.constants";
import { logger } from "../../logger/logger.service";
import { ConsoleTagLogger } from "../../logger/console-tag.logger";
import { PostgresConnectionOptions } from "./postgres-connection.options";
import { PostgresNetworkDiagnostic } from "./postgres-network.diagnostic";

export class BasePostgresConnection {
  private database?: NodePgDatabase;
  private pool?: Pool;
  private readonly poolConfig: Omit<PoolConfig, "connectionString">;
  private readonly connectionName: string;
  private readonly connectionOptions: PostgresConnectionOptions;

  constructor(
    connectionOptions: PostgresConnectionOptions,
    poolConfig: Omit<PoolConfig, "connectionString">,
    connectionName: string,
  ) {
    this.connectionOptions = connectionOptions;
    this.poolConfig = poolConfig;
    this.connectionName = connectionName;
  }

  public getInstance(): NodePgDatabase {
    if (!this.database) {
      const connectionTarget =
        this.connectionOptions.connectionString ?
          { connectionString: this.connectionOptions.connectionString }
        : {
            host: this.connectionOptions.host,
            port: this.connectionOptions.port,
            database: this.connectionOptions.database,
            user: this.connectionOptions.user,
            password: this.connectionOptions.password,
          };

      this.pool = new Pool({
        ...connectionTarget,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
        ssl:
          this.connectionOptions.ssl ?
            {
              rejectUnauthorized: false,
            }
          : false,
        ...this.poolConfig,
      });

      this.database = drizzle(this.pool);
    }

    return this.database;
  }

  public async connect(): Promise<void> {
    if (!this.pool) {
      this.getInstance();
    }

    try {
      ConsoleTagLogger.info(
        "POSTGRES",
        `Testing ${this.connectionName} connection...`,
      );

      await this.pool?.query(DatabaseConstants.HEALTH_CHECK_QUERY);
      await this.warmPool();

      ConsoleTagLogger.info(
        "POSTGRES",
        `${this.connectionName} connected successfully`,
      );
      await logger.info(`${this.connectionName} connected successfully`, {
        module: "database.postgres",
        tags: ["database", "postgres", this.connectionName, "connect", "ok"],
      });
    } catch (error: unknown) {
      const normalizedError =
        error instanceof Error ? error : new Error("Postgres connect failed");
      const diagnostic = await PostgresNetworkDiagnostic.inspect(
        this.connectionOptions.host,
        this.connectionOptions.port,
      );

      ConsoleTagLogger.error(
        "POSTGRES",
        `${this.connectionName} connection failed: ${normalizedError.message}`,
      );
      ConsoleTagLogger.error("POSTGRES", `[DIAGNOSTIC] ${diagnostic.message}`);

      await logger.error(normalizedError, {
        module: "database.postgres",
        tags: [
          "database",
          "postgres",
          this.connectionName,
          "connect",
          "failed",
        ],
      });
      throw new Error(
        `${this.connectionName} connection failed: ${normalizedError.message}. ${diagnostic.message}`,
        {
          cause: error,
        },
      );
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.pool) {
      return;
    }

    try {
      await this.pool.end();
      ConsoleTagLogger.info(
        "POSTGRES",
        `${this.connectionName} disconnected successfully`,
      );
      await logger.info(`${this.connectionName} disconnected successfully`, {
        module: "database.postgres",
        tags: ["database", "postgres", this.connectionName, "disconnect", "ok"],
      });
    } catch (error: unknown) {
      const normalizedError =
        error instanceof Error ? error : (
          new Error("Postgres disconnect failed")
        );

      ConsoleTagLogger.error(
        "POSTGRES",
        `${this.connectionName} disconnect failed:`,
        error,
      );
      await logger.error(normalizedError, {
        module: "database.postgres",
        tags: [
          "database",
          "postgres",
          this.connectionName,
          "disconnect",
          "failed",
        ],
      });
      throw error;
    } finally {
      this.pool = undefined;
      this.database = undefined;
    }
  }

  private async warmPool(): Promise<void> {
    const minimumConnections =
      typeof this.poolConfig.min === "number" ? this.poolConfig.min : 0;

    if (!this.pool || minimumConnections <= 1) {
      return;
    }

    await Promise.all(
      Array.from({ length: minimumConnections - 1 }, () =>
        this.pool?.query(DatabaseConstants.HEALTH_CHECK_QUERY),
      ),
    );
  }
}
