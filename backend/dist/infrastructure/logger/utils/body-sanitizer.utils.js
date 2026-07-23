export class BodySanitizerUtils {
    static sanitize(data, maskedFields) {
        if (data === null || data === undefined) {
            return data;
        }
        if (Array.isArray(data)) {
            return data.map((item) => BodySanitizerUtils.sanitize(item, maskedFields));
        }
        if (typeof data !== "object") {
            return data;
        }
        const maskedObject = {};
        for (const [key, value] of Object.entries(data)) {
            const normalizedKey = key.toLowerCase();
            if (maskedFields.includes(normalizedKey)) {
                maskedObject[key] = "********";
                continue;
            }
            maskedObject[key] = BodySanitizerUtils.sanitize(value, maskedFields);
        }
        return maskedObject;
    }
}
