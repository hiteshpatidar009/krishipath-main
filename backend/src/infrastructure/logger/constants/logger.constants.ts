export class LoggerConstants {
  public static readonly COLLECTION_NAME = "platform_logs";

  public static readonly LEVEL_INFO = "info";
  public static readonly LEVEL_WARN = "warn";
  public static readonly LEVEL_WARNING = "warning";
  public static readonly LEVEL_ERROR = "error";
  public static readonly LEVEL_DEBUG = "debug";
  public static readonly LEVEL_FATAL = "fatal";
  public static readonly LEVEL_CRITICAL = "critical";
  public static readonly LEVEL_SECURITY = "security";

  public static readonly DEFAULT_TAGS: string[] = [];

  public static readonly MAX_MESSAGE_LENGTH = 5000;
  public static readonly MAX_STACK_LENGTH = 20000;

  public static readonly MASKED_FIELDS: string[] = [
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

  public static readonly SENSITIVE_HEADERS: string[] = [
    "authorization",
    "cookie",
    "x-api-key",
    "x-access-token",
    "x-refresh-token",
  ];
}
