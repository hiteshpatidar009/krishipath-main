export class IdUtil {
  private static readonly uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  public static isUuid(value: unknown): value is string {
    return typeof value === "string" && IdUtil.uuidPattern.test(value);
  }
}
