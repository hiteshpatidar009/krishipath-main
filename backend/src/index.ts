import { Server } from "./server";
import { logger } from "./infrastructure/logger/logger.service";
import { ConsoleTagLogger } from "./infrastructure/logger/console-tag.logger";
import { RuntimeLoggerService } from "./infrastructure/logger/services/runtime-logger.service";
import { AsyncHandler } from "./shared/utils/async_handler";

import dns from "node:dns";
dns.setServers(["1.1.1.1"]);

class Bootstrap {
  public static async start(): Promise<void> {
    ConsoleTagLogger.info("BOOTSTRAP", "Starting application...");
    RuntimeLoggerService.install();
    await logger.info("Bootstrap started", {
      module: "bootstrap",
      tags: ["bootstrap", "start"],
    });

    const result = await AsyncHandler.handle(async () => {
      const server = new Server();
      await server.start();
    });

    AsyncHandler.match(result, {
      ok: () => {
        ConsoleTagLogger.info("BOOTSTRAP", "Application started successfully");
        void logger.info("Application started successfully");
      },
      err: (e) => {
        ConsoleTagLogger.error(
          "BOOTSTRAP",
          "Application bootstrap failed:",
          e.message,
        );
        void logger.fatal(new Error(e.message), {
          module: "bootstrap",
          tags: ["bootstrap", "failed"],
          payload: {
            statusCode: e.statusCode,
          },
        });
        process.exit(1);
      },
    });
  }
}

Bootstrap.start();
