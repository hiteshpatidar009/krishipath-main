export class LoggerConstants {
    static COLLECTION_NAME = "platform_logs";
    static LEVEL_INFO = "info";
    static LEVEL_WARN = "warn";
    static LEVEL_WARNING = "warning";
    static LEVEL_ERROR = "error";
    static LEVEL_DEBUG = "debug";
    static LEVEL_FATAL = "fatal";
    static LEVEL_CRITICAL = "critical";
    static LEVEL_SECURITY = "security";
    static DEFAULT_TAGS = [];
    static MAX_MESSAGE_LENGTH = 5000;
    static MAX_STACK_LENGTH = 20000;
    static MASKED_FIELDS = [
        "password",
        "confirmPassword",
        "oldPassword",
        "newPassword",
        "token",
        "refreshToken",
        "accessToken",
        "authorization",
        "cookie",
        "secret",
        "apiKey",
        "api_key",
        "clientSecret",
        "otp",
        "pin",
        "cvv",
    ];
    static SENSITIVE_HEADERS = [
        "authorization",
        "cookie",
        "x-api-key",
        "x-access-token",
        "x-refresh-token",
    ];
}
