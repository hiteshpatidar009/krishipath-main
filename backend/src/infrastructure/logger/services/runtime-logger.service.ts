import { logger } from "../logger.service";

export class RuntimeLoggerService {
  private static installed = false;

  public static install(): void {
    if (RuntimeLoggerService.installed) {
      return;
    }

    process.on("uncaughtException", (error: Error) => {
      void logger.fatal(error, {
        module: "runtime",
        tags: ["runtime", "panic", "uncaughtException"],
      });
    });

    process.on("unhandledRejection", (reason: unknown) => {
      const error =
        reason instanceof Error
          ? reason
          : new Error(`Unhandled rejection: ${String(reason)}`);

      void logger.fatal(error, {
        module: "runtime",
        tags: ["runtime", "panic", "unhandledRejection"],
      });
    });

    process.on("warning", (warning: Error) => {
      void logger.warn(warning.message, {
        module: "runtime",
        tags: ["runtime", "warning"],
        payload: {
          name: warning.name,
          stack: warning.stack,
        },
      });
    });

    RuntimeLoggerService.installed = true;
  }
}
