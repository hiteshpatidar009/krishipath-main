export interface PostgresConnectionOptions {
  connectionString?: string;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
}
