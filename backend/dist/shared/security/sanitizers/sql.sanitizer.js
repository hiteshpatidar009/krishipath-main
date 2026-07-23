export class SqlSanitizer {
    static commentPattern = /(--|\/\*|\*\/)/g;
    normalize(value) {
        if (typeof value === "string") {
            return value.replace(SqlSanitizer.commentPattern, "").trim();
        }
        if (Array.isArray(value)) {
            return value.map((item) => this.normalize(item));
        }
        if (value && typeof value === "object") {
            const normalized = {};
            for (const [key, nestedValue] of Object.entries(value)) {
                normalized[key] = this.normalize(nestedValue);
            }
            return normalized;
        }
        return value;
    }
}
