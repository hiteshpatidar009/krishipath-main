import mongoose from "mongoose";
import { env } from "../config/env";
import { logger } from "../logger/logger";

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);

    logger.info("✅ MongoDB Connected Successfully");
  } catch (error) {
    logger.error(error);

    logger.fatal("❌ Failed to connect MongoDB");

    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();

    logger.info("MongoDB Connection Closed");
  } catch (error) {
    logger.error(error);
  }
}