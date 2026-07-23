import { z } from "zod";

const envBooleanSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const normalizedValue = value.trim().toLowerCase();
  if (["true", "1", "yes", "y", "on"].includes(normalizedValue)) {
    return true;
  }

  if (["false", "0", "no", "n", "off"].includes(normalizedValue)) {
    return false;
  }

  return value;
}, z.boolean());

export class EnvValidator {
  private static readonly aliasMap = {
    // # SERVER
    NODE_ENV: ["NODE_ENV", "_ENV"],
    PORT: ["PORT", "_PORT"],
    APP_BASE_URL: ["APP_BASE_URL", "_APP_BASE_URL"],
    FRONTEND_BASE_URL: ["FRONTEND_BASE_URL", "_FRONTEND_BASE_URL"],
    CORS_ORIGINS: ["CORS_ORIGINS", "_CORS_ORIGINS", "_CORS"],
    CORS_CREDENTIALS: ["CORS_CREDENTIALS", "_CORS_CREDENTIALS"],
    REQUEST_BODY_LIMIT: ["REQUEST_BODY_LIMIT", "_REQUEST_BODY_LIMIT"],
    RESOURCE_NAMESPACE: ["RESOURCE_NAMESPACE", "_RESOURCE_NAMESPACE"],
    CAPTCHA_ENABLED: ["CAPTCHA_ENABLED", "_CAPTCHA_ENABLED"],
    EXTERNAL_HTTP_TIMEOUT_MS: [
      "EXTERNAL_HTTP_TIMEOUT_MS",
      "_EXTERNAL_HTTP_TIMEOUT_MS",
    ],
    POSTGRES_CONNECTION_TIMEOUT_MS: [
      "POSTGRES_CONNECTION_TIMEOUT_MS",
      "_POSTGRES_CONNECTION_TIMEOUT_MS",
    ],
    POSTGRES_QUERY_TIMEOUT_MS: [
      "POSTGRES_QUERY_TIMEOUT_MS",
      "_POSTGRES_QUERY_TIMEOUT_MS",
    ],
    POSTGRES_STATEMENT_TIMEOUT_MS: [
      "POSTGRES_STATEMENT_TIMEOUT_MS",
      "_POSTGRES_STATEMENT_TIMEOUT_MS",
    ],
    POSTGRES_NETWORK_DIAGNOSTIC_TIMEOUT_MS: [
      "POSTGRES_NETWORK_DIAGNOSTIC_TIMEOUT_MS",
      "_POSTGRES_NETWORK_DIAGNOSTIC_TIMEOUT_MS",
    ],

    // # JWT
    JWT_ACCESS_SECRET_KEY: ["JWT_ACCESS_SECRET_KEY", "_JWT_ACCESS_SECRET_KEY"],
    JWT_ACCESS_EXPIRY_TIME: [
      "JWT_ACCESS_EXPIRY_TIME",
      "_JWT_ACCESS_EXPIRY_TIME",
    ],
    JWT_REFRESH_SECRET_KEY: [
      "JWT_REFRESH_SECRET_KEY",
      "_JWT_REFRESH_SECRET_KEY",
    ],
    JWT_REFRESH_EXPIRY_TIME: [
      "JWT_REFRESH_EXPIRY_TIME",
      "_JWT_REFRESH_EXPIRY_TIME",
    ],
    TOTP_ISSUER: ["TOTP_ISSUER", "_TOTP_ISSUER"],
    MFA_TRUST_WINDOW_MINUTES: [
      "MFA_TRUST_WINDOW_MINUTES",
      "_MFA_TRUST_WINDOW_MINUTES",
    ],
    PASSWORD_RESET_URL: ["PASSWORD_RESET_URL", "_PASSWORD_RESET_URL"],
    PASSWORD_RESET_TOKEN_TTL_MINUTES: [
      "PASSWORD_RESET_TOKEN_TTL_MINUTES",
      "_PASSWORD_RESET_TOKEN_TTL_MINUTES",
    ],

    // # DATABASE - DB 1
    _DB_URL_ONE: ["_DB_URL_ONE", "DB_URL_ONE", "DATABASE_URL_ONE", "DB1_URL", "DB1_DATABASE_URL"],
    _DB_HOST_ONE: ["_DB_HOST_ONE", "DB_HOST_ONE"],
    _DB_PORT_ONE: ["_DB_PORT_ONE", "DB_PORT_ONE"],
    _DB_NAME_ONE: ["_DB_NAME_ONE", "DB_NAME_ONE"],
    _DB_USER_ONE: ["_DB_USER_ONE", "DB_USER_ONE"],
    _DB_PASSWORD_ONE: ["_DB_PASSWORD_ONE", "DB_PASSWORD_ONE"],
    _DB_SSL_ONE: ["_DB_SSL_ONE", "DB_SSL_ONE"],

    // # SERVICES
    REDIS_URL: ["REDIS_URL", "_REDIS_URL"],
    MONGODB_URL: ["MONGODB_URL", "_MONGODB_URL"],
    EMAIL_PROVIDER_URL: ["EMAIL_PROVIDER_URL", "_EMAIL_PROVIDER_URL"],
    EMAIL_PROVIDER_API_KEY: ["EMAIL_PROVIDER_API_KEY", "_EMAIL_PROVIDER_API_KEY"],
    SMS_PROVIDER_URL: ["SMS_PROVIDER_URL", "_SMS_PROVIDER_URL"],
    SMS_PROVIDER_API_KEY: ["SMS_PROVIDER_API_KEY", "_SMS_PROVIDER_API_KEY"],
    PUSH_PROVIDER_URL: ["PUSH_PROVIDER_URL", "_PUSH_PROVIDER_URL"],
    PUSH_PROVIDER_API_KEY: ["PUSH_PROVIDER_API_KEY", "_PUSH_PROVIDER_API_KEY"],
    MONGODB_APP_LOGS_DB: ["MONGODB_APP_LOGS_DB", "_MONGODB_APP_LOGS_DB"],
    MONGODB_ACTIVITIES_DB: ["MONGODB_ACTIVITIES_DB", "_MONGODB_ACTIVITIES_DB"],
    TWILIO_ACCOUNT_SID: ["TWILIO_ACCOUNT_SID", "_TWILIO_ACCOUNT_SID"],
    TWILIO_AUTH_TOKEN: ["TWILIO_AUTH_TOKEN", "_TWILIO_AUTH_TOKEN"],
    TWILIO_SMS_FROM: ["TWILIO_SMS_FROM", "_TWILIO_SMS_FROM"],
    TWILIO_WHATSAPP_FROM: ["TWILIO_WHATSAPP_FROM", "_TWILIO_WHATSAPP_FROM"],
    BREVO_API_KEY: ["BREVO_API_KEY", "_BREVO_API_KEY"],
    BREVO_FROM_EMAIL: ["BREVO_FROM_EMAIL", "_BREVO_FROM_EMAIL"],
    GEMINI_API_KEY: ["GEMINI_API_KEY", "_GEMINI_API_KEY"],
    OPENWEATHERMAP_API_KEY: ["OPENWEATHERMAP_API_KEY", "_OPENWEATHERMAP_API_KEY"],
    FCM_SERVER_KEY: ["FCM_SERVER_KEY", "_FCM_SERVER_KEY"],
    RAZORPAY_KEY_ID: ["RAZORPAY_KEY_ID", "_RAZORPAY_KEY_ID"],
    RAZORPAY_KEY_SECRET: ["RAZORPAY_KEY_SECRET", "_RAZORPAY_KEY_SECRET"],
    MSG91_AUTH_KEY: ["MSG91_AUTH_KEY", "_MSG91_AUTH_KEY"],
    CDN_BASE_URL: ["CDN_BASE_URL", "_CDN_BASE_URL"],
    REDIS_WEATHER_TTL: ["REDIS_WEATHER_TTL", "_REDIS_WEATHER_TTL"],

    USER_ACTIVITY_LOG_RETENTION_DAYS: [
      "USER_ACTIVITY_LOG_RETENTION_DAYS",
      "_USER_ACTIVITY_LOG_RETENTION_DAYS",
    ],
    AUDIT_LOG_RETENTION_DAYS: [
      "AUDIT_LOG_RETENTION_DAYS",
      "_AUDIT_LOG_RETENTION_DAYS",
    ],
    PLATFORM_LOG_RETENTION_DAYS: [
      "PLATFORM_LOG_RETENTION_DAYS",
      "_PLATFORM_LOG_RETENTION_DAYS",
    ],
  } as const;

  private static readonly schema = z.object({
    // # SERVER
    NODE_ENV: z.enum(["development", "production"]),
    PORT: z.coerce.number(),
    APP_BASE_URL: z.url().optional(),
    FRONTEND_BASE_URL: z.url().default("http://localhost:3000"),
    CORS_ORIGINS: z.string().min(1).default("http://localhost:3000,http://localhost:5173,https://krishipath.vercel.app"),
    CORS_CREDENTIALS: envBooleanSchema.default(true),
    REQUEST_BODY_LIMIT: z.string().min(1).default("10mb"),
    RESOURCE_NAMESPACE: z.string().min(1).optional(),
    CAPTCHA_ENABLED: envBooleanSchema.default(true),
    EXTERNAL_HTTP_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
    POSTGRES_CONNECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
    POSTGRES_QUERY_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
    POSTGRES_STATEMENT_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
    POSTGRES_NETWORK_DIAGNOSTIC_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),

    // # JWT
    JWT_ACCESS_SECRET_KEY: z.string().min(1),
    JWT_ACCESS_EXPIRY_TIME: z.string(),

    JWT_REFRESH_SECRET_KEY: z.string().min(1),
    JWT_REFRESH_EXPIRY_TIME: z.string(),
    TOTP_ISSUER: z.string().min(1).default("KrishiPath"),
    MFA_TRUST_WINDOW_MINUTES: z.coerce
      .number()
      .int()
      .refine((value) => [5, 15, 30, 60].includes(value), {
        message: "MFA trust window must be 5, 15, 30, or 60 minutes",
      })
      .default(15),
    PASSWORD_RESET_URL: z.url().optional(),
    PASSWORD_RESET_TOKEN_TTL_MINUTES: z.coerce
      .number()
      .int()
      .positive()
      .max(60)
      .default(15),

    // # DATABASE - DB 1
    _DB_URL_ONE: z.url().optional(),
    _DB_HOST_ONE: z.string().optional().default(""),
    _DB_PORT_ONE: z.coerce.number().int().positive().default(5432),
    _DB_NAME_ONE: z.string().optional().default(""),
    _DB_USER_ONE: z.string().optional().default(""),
    _DB_PASSWORD_ONE: z.string().optional().default(""),
    _DB_SSL_ONE: envBooleanSchema.default(true),

    // # SERVICES
    REDIS_URL: z.url(),
    MONGODB_URL: z.url(),

    EMAIL_PROVIDER_URL: z.url().optional(),
    EMAIL_PROVIDER_API_KEY: z.string().optional(),

    SMS_PROVIDER_URL: z.url().optional(),
    SMS_PROVIDER_API_KEY: z.string().optional(),

    PUSH_PROVIDER_URL: z.url().optional(),
    PUSH_PROVIDER_API_KEY: z.string().optional(),

    MONGODB_APP_LOGS_DB: z.string().min(1).default("app_logs"),

    MONGODB_ACTIVITIES_DB: z.string().min(1).default("activities"),

    TWILIO_ACCOUNT_SID: z.string().optional(),
    TWILIO_AUTH_TOKEN: z.string().optional(),
    TWILIO_SMS_FROM: z.string().optional(),
    TWILIO_WHATSAPP_FROM: z.string().optional(),

    BREVO_API_KEY: z.string().optional(),
    BREVO_FROM_EMAIL: z.string().email().optional(),

    GEMINI_API_KEY: z.string().optional(),
    OPENWEATHERMAP_API_KEY: z.string().optional(),
    FCM_SERVER_KEY: z.string().optional(),
    RAZORPAY_KEY_ID: z.string().optional(),
    RAZORPAY_KEY_SECRET: z.string().optional(),
    MSG91_AUTH_KEY: z.string().optional(),
    CDN_BASE_URL: z.url().optional(),
    REDIS_WEATHER_TTL: z.coerce.number().int().positive().default(1800),

    USER_ACTIVITY_LOG_RETENTION_DAYS: z.coerce.number().int().positive().default(180),
    AUDIT_LOG_RETENTION_DAYS: z.coerce.number().int().min(2555).default(2555),
    PLATFORM_LOG_RETENTION_DAYS: z.coerce.number().int().positive().default(90),
  }).superRefine((value, ctx) => {
    const hasDbConfig = (
      url: string | undefined,
      host: string,
      database: string,
      user: string,
      password: string,
      label: string,
    ): void => {
      if (url || (host && database && user && password)) {
        return;
      }

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [label],
        message: `${label} requires DB URL or host/name/user/password`,
      });
    };

    hasDbConfig(
      value._DB_URL_ONE,
      value._DB_HOST_ONE,
      value._DB_NAME_ONE,
      value._DB_USER_ONE,
      value._DB_PASSWORD_ONE,
      "DB1",
    );


    if (value.NODE_ENV !== "production") {
      return;
    }

    const requiredProductionKeys: readonly (keyof typeof value)[] = [
      "APP_BASE_URL",
      "FRONTEND_BASE_URL",
      "BREVO_API_KEY",
      "BREVO_FROM_EMAIL",
      "TWILIO_ACCOUNT_SID",
      "TWILIO_AUTH_TOKEN",
      "TWILIO_SMS_FROM",
      "TWILIO_WHATSAPP_FROM",
    ];

    for (const key of requiredProductionKeys) {
      if (!value[key]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} is required in production`,
        });
      }
    }
  });

  public static get type() {
    return this.schema;
  }

  public static validate(env: NodeJS.ProcessEnv): EnvSchemaType {
    const normalizedEnvironment = this.normalizeEnvironment(env);

    const parsed = this.schema.safeParse(normalizedEnvironment);

    if (!parsed.success) {
      process.stderr.write("Invalid environment variables:\n");
      process.stderr.write(`${parsed.error}\n`);
      process.exit(1);
    }

    return parsed.data;
  }

  private static normalizeEnvironment(
    env: NodeJS.ProcessEnv,
  ): Record<string, string | undefined> {
    const normalizedEnvironment: Record<string, string | undefined> = {};

    for (const [canonicalKey, aliases] of Object.entries(this.aliasMap)) {
      normalizedEnvironment[canonicalKey] = this.resolveAliasedValue(
        env,
        aliases,
      );
    }

    return normalizedEnvironment;
  }

  private static resolveAliasedValue(
    env: NodeJS.ProcessEnv,
    aliases: readonly string[],
  ): string | undefined {
    for (const alias of aliases) {
      const value = env[alias];

      if (value !== undefined && value !== "") {
        return value;
      }
    }

    return undefined;
  }
}

export type EnvSchemaType = z.infer<(typeof EnvValidator)["type"]>;
