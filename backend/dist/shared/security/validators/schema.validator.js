export class SchemaValidator {
    validate(schema, value) {
        return schema.parse(value);
    }
    format(error) {
        const formatted = {};
        for (const issue of error.issues) {
            const path = issue.path.join(".") || "root";
            formatted[path] = [...(formatted[path] ?? []), issue.message];
        }
        return formatted;
    }
}
