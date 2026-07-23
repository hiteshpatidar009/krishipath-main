export class DatabaseConstants {
  public static readonly HEALTH_CHECK_QUERY = "SELECT 1";
}

export const DATABASE_CONNECTION_NAMES = {
  db1: "DB1",

  mongodb: "MongoDB",
  redis: "Redis",
} as const;
