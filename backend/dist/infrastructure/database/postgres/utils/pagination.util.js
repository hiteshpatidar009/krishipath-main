export class PaginationUtil {
    static normalize(input) {
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
