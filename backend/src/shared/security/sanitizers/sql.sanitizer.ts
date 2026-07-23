export class SqlSanitizer {
  private static readonly commentPattern = /(--|\/\*|\*\/)/g;

  public normalize(value: unknown): unknown {
    if (typeof value === "string") {
      return value.replace(SqlSanitizer.commentPattern, "").trim();
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.normalize(item));
    }

    if (value && typeof value === "object") {
      const normalized: Record<string, unknown> = {};
      for (const [key, nestedValue] of Object.entries(value)) {
        normalized[key] = this.normalize(nestedValue);
      }
      return normalized;
    }

    return value;
  }
}
