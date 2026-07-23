import { CUSTOMER_DEFAULTS, CUSTOMER_SORT_FIELDS } from "../constants/customer.constants";
export class CustomerPaginationUtil {
    static normalize(query) {
        const limit = Math.min(Math.max(Number(query.limit ?? CUSTOMER_DEFAULTS.limit), 1), CUSTOMER_DEFAULTS.maxLimit);
        const page = Math.max(Number(query.page ?? CUSTOMER_DEFAULTS.page), 1);
        const sortBy = CUSTOMER_SORT_FIELDS.includes(query.sortBy) ? query.sortBy : "createdAt";
        return {
            page,
            limit,
            cursor: query.cursor,
            search: query.search?.trim(),
            sortBy,
            sortOrder: query.sortOrder === "asc" ? "asc" : "desc",
        };
    }
    static nextCursor(items, limit) {
        return items.length === limit ? items[items.length - 1]?.id : undefined;
    }
}
