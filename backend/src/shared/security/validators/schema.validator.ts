import { z, ZodType } from "zod";

export class SchemaValidator {
  public validate<T>(schema: ZodType<T>, value: unknown): T {
    return schema.parse(value);
  }

  public format(error: z.ZodError): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};

    for (const issue of error.issues) {
      const path = issue.path.join(".") || "root";
      formatted[path] = [...(formatted[path] ?? []), issue.message];
    }

    return formatted;
  }
}
