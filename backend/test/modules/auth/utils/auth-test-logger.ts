export class AuthTestLogger {
  public info(message: string, metadata: Record<string, unknown> = {}): void {
    this.write("INFO", message, metadata);
  }

  public warn(message: string, metadata: Record<string, unknown> = {}): void {
    this.write("WARN", message, metadata);
  }

  public error(message: string, metadata: Record<string, unknown> = {}): void {
    this.write("ERROR", message, metadata);
  }

  private write(
    level: "INFO" | "WARN" | "ERROR",
    message: string,
    metadata: Record<string, unknown>,
  ): void {
    const suffix = Object.keys(metadata).length
      ? ` ${JSON.stringify(metadata)}`
      : "";
    process.stdout.write(`[AUTH-TEST] ${level} ${message}${suffix}\n`);
  }
}
