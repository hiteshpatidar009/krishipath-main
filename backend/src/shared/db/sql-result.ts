export class SqlResult {
  public static rows<T>(result: unknown): T[] {
    if (typeof result === "object" && result !== null && "rows" in result) {
      return (result as { rows: T[] }).rows;
    }

    return [];
  }
}
