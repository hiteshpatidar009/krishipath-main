import { and } from "drizzle-orm";
export class QueryBuilderUtil {
    static andAll(filters) {
        const applied = filters.filter((filter) => Boolean(filter));
        if (!applied.length) {
            return undefined;
        }
        if (applied.length === 1) {
            return applied[0];
        }
        return and(...applied);
    }
}
