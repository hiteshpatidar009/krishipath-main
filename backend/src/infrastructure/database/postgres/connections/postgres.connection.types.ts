import { Pool } from "node_modules/@types/pg";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export interface IPostgresConnection {
  getInstance(): NodePgDatabase;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

export type PostgresConnectionState = {
  pool?: Pool;
  database?: NodePgDatabase;
};
