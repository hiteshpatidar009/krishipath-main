import { SQL, and } from "drizzle-orm";

export class QueryBuilderUtil {
  public static andAll(filters: Array<SQL | undefined>): SQL | undefined {
    const applied = filters.filter((filter): filter is SQL => Boolean(filter));
    if (!applied.length) {
      return undefined;
    }

    if (applied.length === 1) {
      return applied[0];
    }

    return and(...applied);
  }
}
