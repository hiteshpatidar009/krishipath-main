export class BodySanitizerUtils {
  public static sanitize(
    data: unknown,
    maskedFields: string[],
  ): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => BodySanitizerUtils.sanitize(item, maskedFields));
    }

    if (typeof data !== "object") {
      return data;
    }

    const maskedObject: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const normalizedKey = key.toLowerCase();

      if (maskedFields.includes(normalizedKey)) {
        maskedObject[key] = "********";
        continue;
      }

      maskedObject[key] = BodySanitizerUtils.sanitize(value, maskedFields);
    }

    return maskedObject;
  }
}
