import { SqlSanitizer } from "../sanitizers/sql.sanitizer";
import { XssSanitizer } from "../sanitizers/xss.sanitizer";
export class InputSanitizationMiddleware {
    static xss = new XssSanitizer();
    static sql = new SqlSanitizer();
    static use(request, _response, next) {
        request.body = InputSanitizationMiddleware.sanitize(request.body);
        if (InputSanitizationMiddleware.isRecord(request.query)) {
            const sanitizedQuery = InputSanitizationMiddleware.sanitize(request.query);
            if (InputSanitizationMiddleware.isRecord(sanitizedQuery)) {
                InputSanitizationMiddleware.replaceObjectContent(request.query, sanitizedQuery);
            }
        }
        if (InputSanitizationMiddleware.isRecord(request.params)) {
            const sanitizedParams = InputSanitizationMiddleware.sanitize(request.params);
            if (InputSanitizationMiddleware.isRecord(sanitizedParams)) {
                InputSanitizationMiddleware.replaceObjectContent(request.params, sanitizedParams);
            }
        }
        next();
    }
    static sanitize(value) {
        return InputSanitizationMiddleware.sql.normalize(InputSanitizationMiddleware.xss.sanitize(value));
    }
    static isRecord(value) {
        return Boolean(value) && typeof value === "object" && !Array.isArray(value);
    }
    static replaceObjectContent(target, source) {
        for (const key of Object.keys(target)) {
            delete target[key];
        }
        for (const [key, value] of Object.entries(source)) {
            target[key] = value;
        }
    }
}
