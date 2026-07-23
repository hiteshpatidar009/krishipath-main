export interface IDatabaseConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

export type DatabaseName =
  | "db1"

  | "mongodb"
  | "redis";

export interface ManagedDatabaseConnection {
  name: DatabaseName;
  connection: IDatabaseConnection;
  /** Optional infrastructure must not prevent the core HTTP API from starting. */
  optional?: boolean;
}
