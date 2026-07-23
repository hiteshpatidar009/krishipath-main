import Redis from "ioredis";

import { env } from "../../config/env";
import { logger } from "../../logger/logger.service";
import { ConsoleTagLogger } from "../../logger/console-tag.logger";

export class RedisConnection {
  private static client: Redis | undefined;

  public static getInstance(): Redis {
    if (
      !RedisConnection.client ||
      RedisConnection.client.status === "end" ||
      RedisConnection.client.status === "close"
    ) {
      RedisConnection.client = new Redis(env.redisUrl, {
        lazyConnect: false,
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy: (times: number) => (times > 3 ? null : times * 100),
      });

      RedisConnection.client.on("error", (error: Error) => {
        const errorMessage = error.message || "Redis connection error";
        const redisError = new Error(errorMessage);

        void logger.error(redisError, {
          module: "database.redis",
          tags: ["database", "redis", "client", "error"],
        });
      });
    }

    return RedisConnection.client;
  }

  public static async connect(): Promise<void> {
    const client: Redis = RedisConnection.getInstance();

    try {
      ConsoleTagLogger.info("REDIS", "Connecting to Redis...");

      if (client.status === "wait") {
        await client.connect();
      }

      await client.ping();

      ConsoleTagLogger.info("REDIS", "Connected successfully");
      await logger.info("Redis connected successfully", {
        module: "database.redis",
        tags: ["database", "redis", "connect", "ok"],
      });
    } catch (error: unknown) {
      const normalizedError =
        error instanceof Error ? error : new Error("Redis connect failed");

      ConsoleTagLogger.error(
        "REDIS",
        "Connection failed:",
        normalizedError.message,
      );
      await logger.error(normalizedError, {
        module: "database.redis",
        tags: ["database", "redis", "connect", "failed"],
      });

      throw error;
    }
  }

  public static async disconnect(): Promise<void> {
    if (RedisConnection.client) {
      try {
        ConsoleTagLogger.info("REDIS", "Disconnecting from Redis...");
        await RedisConnection.client.quit();
        ConsoleTagLogger.info("REDIS", "Disconnected successfully");
        await logger.info("Redis disconnected successfully", {
          module: "database.redis",
          tags: ["database", "redis", "disconnect", "ok"],
        });
      } catch (error: unknown) {
        const normalizedError =
          error instanceof Error ? error : new Error("Redis disconnect failed");

        ConsoleTagLogger.error(
          "REDIS",
          "Disconnect failed:",
          normalizedError.message,
        );
        await logger.error(normalizedError, {
          module: "database.redis",
          tags: ["database", "redis", "disconnect", "failed"],
        });

        throw error;
      } finally {
        RedisConnection.client.removeAllListeners();
        RedisConnection.client = undefined;
      }
    }
  }
}
