export class HeaderSanitizerUtils {
    static sanitize(headers, sensitiveHeaders) {
        const sanitizedHeaders = {};
        for (const [key, value] of Object.entries(headers)) {
            const normalizedKey = key.toLowerCase();
            sanitizedHeaders[key] =
                sensitiveHeaders.includes(normalizedKey) ? "********" : value;
        }
        return sanitizedHeaders;
    }
}
