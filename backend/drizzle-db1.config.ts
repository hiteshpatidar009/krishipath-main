import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: "./src/infrastructure/database/postgres/schemas/db1/index.ts",
  out: "./database/migrations/db1",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env._DB_HOST_ONE || "",
    port: Number(process.env._DB_PORT_ONE || 5432),
    user: process.env._DB_USER_ONE || "",
    password: process.env._DB_PASSWORD_ONE || "",
    database: process.env._DB_NAME_ONE || "",
    ssl: { rejectUnauthorized: false },
  },
});
