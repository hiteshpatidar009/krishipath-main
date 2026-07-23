import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { env } from "../../../config/env";
import { BasePostgresConnection } from "../base-postgres.connection";

export class Db1Connection {
  private static readonly connection = new BasePostgresConnection(
    env.db1Options,
    {
      max: 10,
      min: 2,
      idleTimeoutMillis: 0,
      connectionTimeoutMillis: env.postgresConnectionTimeoutMs,
      query_timeout: env.postgresQueryTimeoutMs,
      statement_timeout: env.postgresStatementTimeoutMs,
    },
    "DB1",
  );

  public static getInstance(): NodePgDatabase {
    return Db1Connection.connection.getInstance();
  }

  public static async connect(): Promise<void> {
    await Db1Connection.connection.connect();
  }

  public static async disconnect(): Promise<void> {
    await Db1Connection.connection.disconnect();
  }
}
