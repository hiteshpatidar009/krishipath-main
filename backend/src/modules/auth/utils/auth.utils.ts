export class AuthUtils {
  public static extractBearerToken(headerValue?: string): string | null {
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
