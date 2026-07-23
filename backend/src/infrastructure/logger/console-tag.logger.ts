type ConsoleTag =
  | "BOOTSTRAP"
  | "DATABASE"
  | "MONGODB"
  | "POSTGRES"
  | "REDIS"
  | "LOGGER"
  | "SERVER";

const tagColors: Record<ConsoleTag, string> = {
  BOOTSTRAP: "\x1b[95m",
  DATABASE: "\x1b[96m",
  MONGODB: "\x1b[32m",
  POSTGRES: "\x1b[34m",
  REDIS: "\x1b[31m",
  LOGGER: "\x1b[35m",
  SERVER: "\x1b[33m",
};

export class ConsoleTagLogger {
  private static readonly reset = "\x1b[0m";

  public static info(tag: ConsoleTag, message: string): void {
    process.stdout.write(`${ConsoleTagLogger.formatTag(tag)} ${message}\n`);
  }

  public static warn(tag: ConsoleTag, message: string): void {
    process.stderr.write(`${ConsoleTagLogger.formatTag(tag)} ${message}\n`);
  }

  public static error(tag: ConsoleTag, message: string, error?: unknown): void {
    if (error) {
      process.stderr.write(
        `${ConsoleTagLogger.formatTag(tag)} ${message} ${ConsoleTagLogger.stringify(error)}\n`,
      );
      return;
    }

    process.stderr.write(`${ConsoleTagLogger.formatTag(tag)} ${message}\n`);
  }

  private static formatTag(tag: ConsoleTag): string {
    return `${tagColors[tag]}[${tag}]${ConsoleTagLogger.reset}`;
  }

  private static stringify(error: unknown): string {
    if (error instanceof Error) {
      return error.stack ?? error.message;
    }

    return typeof error === "string" ? error : JSON.stringify(error);
  }
}
