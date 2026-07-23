import { z } from "zod";
import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from "../constants/supplier.constants";
export class PaginationQueryValidator {
    static schema = z.object({
        limit: z
            .number()
            .int()
            .positive()
            .max(PAGINATION_MAX_LIMIT)
            .default(PAGINATION_DEFAULT_LIMIT)
            .optional(),
        offset: z.number().int().nonnegative().default(0).optional(),
        status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED", "BLACKLISTED"]).optional(),
        search: z.string().trim().optional(),
        sortBy: z.enum(["supplierName", "createdAt", "rating"]).default("createdAt").optional(),
        sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
    });
    static validate(input) {
        PaginationQueryValidator.schema.parse(input);
    }
    static parse(input) {
        return PaginationQueryValidator.schema.parse(input);
    }
}
