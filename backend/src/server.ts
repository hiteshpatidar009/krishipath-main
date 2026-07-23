import http, { Server as HttpServer } from "http";
import { AddressInfo } from "net";

import { App } from "./app";
import { databaseManager } from "./infrastructure/database";
import { env } from "./infrastructure/config/env";
import { logger } from "./infrastructure/logger/logger.service";
import { ConsoleTagLogger } from "./infrastructure/logger/console-tag.logger";

export class Server {
  private readonly app: App;
  private httpServer: HttpServer | null;
  private readonly port: number;
  private shutdownHandlersRegistered: boolean;

  constructor() {
    this.app = new App();
    this.httpServer = null;
    this.port = env.port;
    this.shutdownHandlersRegistered = false;
  }

  public async start(): Promise<void> {
    try {
      ConsoleTagLogger.info(
        "SERVER",
        `Starting server on port ${this.port}...`,
      );
      await logger.info("Server start initiated", {
        module: "server",
        tags: ["server", "start"],
      });

      await databaseManager.connectAll();
      await this.app.initialize();

      this.httpServer = http.createServer(this.app.getExpressApp());

      await new Promise<void>((resolve, reject) => {
        this.httpServer?.once("error", (error: Error) => {
          reject(error);
        });

        this.httpServer?.listen(this.port, () => {
          const address = this.httpServer?.address();

          if (!address || typeof address === "string") {
            reject(new Error("Unable to resolve server bind address"));
            return;
          }

          const resolvedAddress: AddressInfo = address;
          ConsoleTagLogger.info(
            "SERVER",
            `Server is running on http://${resolvedAddress.address}:${resolvedAddress.port}`,
          );
          void logger.info(
            `Server is running on port ${resolvedAddress.port.toString()}`,
            {
              module: "server",
              tags: ["server", "listening"],
              payload: {
                host: resolvedAddress.address,
                port: resolvedAddress.port,
              },
            },
          );
          resolve();
        });
      });

      this.registerShutdownHandlers();
    } catch (error: unknown) {
      const normalizedError =
        error instanceof Error ? error : (
          new Error("Unknown server startup error")
        );

      ConsoleTagLogger.error(
        "SERVER",
        `Server startup failed: ${normalizedError.message}`,
      );
      await logger.error(normalizedError, {
        module: "server",
        tags: ["server", "start", "failed"],
      });

      await databaseManager.disconnectAll();
      throw error;
    }
  }

  private registerShutdownHandlers(): void {
    if (this.shutdownHandlersRegistered) {
      return;
    }

    const shutdown = async (signal: string): Promise<void> => {
      ConsoleTagLogger.info(
        "SERVER",
        `${signal} received. Starting graceful shutdown...`,
      );
      void logger.info(`${signal} received. Starting graceful shutdown...`, {
        module: "server",
        tags: ["server", "shutdown", signal],
      });

      try {
        await this.stop();
        ConsoleTagLogger.info("SERVER", "Graceful shutdown completed");
        void logger.info("Graceful shutdown completed", {
          module: "server",
          tags: ["server", "shutdown", signal],
        });
        process.exit(0);
      } catch (error: unknown) {
        const shutdownError =
          error instanceof Error ? error : (
            new Error("Graceful shutdown failed")
          );
        ConsoleTagLogger.error(
          "SERVER",
          "Graceful shutdown failed:",
          shutdownError.message,
        );
        void logger.error(shutdownError);
        process.exit(1);
      }
    };

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });

    this.shutdownHandlersRegistered = true;
  }

  public async stop(): Promise<void> {
    if (!this.httpServer) {
      await databaseManager.disconnectAll();
      return;
    }

    await new Promise<void>((resolve, reject) => {
      this.httpServer?.close((error?: Error) => {
        if (error) {
          ConsoleTagLogger.error(
            "SERVER",
            "HTTP server close failed:",
            error.message,
          );
          void logger.error(error, {
            module: "server",
            tags: ["server", "close", "failed"],
          });
          reject(error);
          return;
        }

        ConsoleTagLogger.info("SERVER", "HTTP server closed successfully");
        void logger.info("HTTP server closed successfully", {
          module: "server",
          tags: ["server", "close", "ok"],
        });
        resolve();
      });
    });

    this.httpServer = null;
    await databaseManager.disconnectAll();
  }
}
