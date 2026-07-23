export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface PaginationOutput {
  page: number;
  limit: number;
  offset: number;
}

export class PaginationUtil {
  public static normalize(input: PaginationInput): PaginationOutput {
    const rawPage = input.page ?? 1;
    const rawLimit = input.limit ?? 20;
    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const limit = Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), 200)
      : 20;
    return {
      page,
      limit,
      offset: (page - 1) * limit,
    };
  }
}
