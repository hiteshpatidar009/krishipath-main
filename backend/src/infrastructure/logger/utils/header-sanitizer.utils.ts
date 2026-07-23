export class HeaderSanitizerUtils {
  public static sanitize(
    headers: Record<string, unknown>,
    sensitiveHeaders: string[],
  ): Record<string, unknown> {
    const sanitizedHeaders: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(headers)) {
      const normalizedKey = key.toLowerCase();
      sanitizedHeaders[key] =
        sensitiveHeaders.includes(normalizedKey) ? "********" : value;
    }

    return sanitizedHeaders;
  }
}
