export class AuthUtils {
    static extractBearerToken(headerValue) {
        if (!headerValue) {
            return null;
        }
        const [scheme, token] = headerValue.split(" ");
        if (scheme !== "Bearer" || !token) {
            return null;
        }
        return token;
    }
}
