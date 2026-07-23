import http from "http";
import app from "./app";
import { env } from "./config/env";
import { logger } from "./logger/logger";
import {
  connectDatabase,
  disconnectDatabase,
} from "./database/mongodb";
import { whatsapp } from "./modules/whatsapp/whatsapp.service";
const server = http.createServer(app);

/**
 * Start Application
 */
async function bootstrap() {
  try {
    logger.info("🚀 Starting KrishiPath WhatsApp Intelligence...");

    // Connect MongoDB
    await connectDatabase();
    await whatsapp.connect();
    // Start HTTP Server
    server.listen(env.PORT, () => {
      logger.info(
        `🚀 Server running on http://localhost:${env.PORT}`
      );
      logger.info(`🌍 Environment : ${env.NODE_ENV}`);
    });
    
  } catch (error) {
    logger.fatal(error);
    process.exit(1);
  }
}

bootstrap();


/**
 * Graceful Shutdown
 */
async function shutdown(signal: string) {
  logger.warn(`${signal} received. Closing application...`);

  server.close(async () => {
    await disconnectDatabase();

    logger.info("✅ Server Closed Successfully");

    process.exit(0);
  });
}

/**
 * Process Events
 */
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));


/**
 * Unexpected Errors
 */
process.on("uncaughtException", (error) => {
  logger.fatal(error, "Uncaught Exception");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.fatal(reason, "Unhandled Promise Rejection");
  process.exit(1);
});