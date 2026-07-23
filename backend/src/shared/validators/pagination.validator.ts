export class PaginationValidator {
  public normalize(query: Record<string, unknown>): { limit: number; offset: number } {
    const limit = Number(query.limit ?? 50);
    const offset = Number(query.offset ?? 0);

    return {
      limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 50,
      offset: Number.isFinite(offset) ? Math.max(offset, 0) : 0,
    };
  }
}
