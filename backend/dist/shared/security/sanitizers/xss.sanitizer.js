export class XssSanitizer {
    static unsafePattern = /<script[\s\S]*?>[\s\S]*?<\/script>|javascript:|on\w+\s*=|<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi;
    sanitize(value) {
        if (typeof value === "string") {
            return value.replace(XssSanitizer.unsafePattern, "").trim();
        }
        if (Array.isArray(value)) {
            return value.map((item) => this.sanitize(item));
        }
        if (value && typeof value === "object") {
            const sanitized = {};
            for (const [key, nestedValue] of Object.entries(value)) {
                sanitized[key] = this.sanitize(nestedValue);
            }
            return sanitized;
        }
        return value;
    }
}
