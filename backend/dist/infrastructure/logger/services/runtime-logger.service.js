import { logger } from "../logger.service";
export class RuntimeLoggerService {
    static installed = false;
    static install() {
        if (RuntimeLoggerService.installed) {
            return;
        }
        process.on("uncaughtException", (error) => {
            void logger.fatal(error, {
                module: "runtime",
                tags: ["runtime", "panic", "uncaughtException"],
            });
        });
        process.on("unhandledRejection", (reason) => {
            const error = reason instanceof Error
                ? reason
                : new Error(`Unhandled rejection: ${String(reason)}`);
            void logger.fatal(error, {
                module: "runtime",
                tags: ["runtime", "panic", "unhandledRejection"],
            });
        });
        process.on("warning", (warning) => {
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
