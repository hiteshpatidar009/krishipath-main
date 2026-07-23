import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

const dbHost = process.env._DB_HOST_TWO || process.env.DB_HOST_TWO || "rsb-db-2.c1qo6kwis0dl.ap-south-1.rds.amazonaws.com";
const dbPort = Number(process.env._DB_PORT_TWO || process.env.DB_PORT_TWO || 5432);
const dbUser = process.env._DB_USER_TWO || process.env.DB_USER_TWO || "rsb_db_2_user";
const dbPassword = process.env._DB_PASSWORD_TWO || process.env.DB_PASSWORD_TWO || "7e35b881dcc5f481ef4c672808a443e82f051b006dd098cb45053734ff73f2d6b158925179967e36e55f30a7d2a8727b929a";
const dbName = process.env._DB_NAME_TWO || process.env.DB_NAME_TWO || "postgres";

export default defineConfig({
  schema: "./src/infrastructure/database/postgres/schemas/db2/all.schema.ts",
  out: "./database/migrations/db2",
  dialect: "postgresql",
  dbCredentials: {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
