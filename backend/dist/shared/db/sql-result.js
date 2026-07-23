export class SqlResult {
    static rows(result) {
        if (typeof result === "object" && result !== null && "rows" in result) {
            return result.rows;
        }
        return [];
    }
}
