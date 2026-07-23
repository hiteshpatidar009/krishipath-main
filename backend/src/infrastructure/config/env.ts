import dotenv from "dotenv";
import { EnvValidator } from "./validate_env";
import { PostgresConnectionOptions } from "../database/postgres/postgres-connection.options";

dotenv.config();

class Env {
  private static instance: Env;

  // # SERVER
  public readonly _environment: string;
  public readonly _port: number;
  public readonly _appBaseUrl?: string;
  public readonly _frontendBaseUrl: string;
  public readonly _corsOrigins: readonly string[];
  public readonly _corsCredentials: boolean;
  public readonly _requestBodyLimit: string;
  public readonly _resourceNamespace: string;
  public readonly _captchaEnabled: boolean;
  public readonly _externalHttpTimeoutMs: number;
  public readonly _postgresConnectionTimeoutMs: number;
  public readonly _postgresQueryTimeoutMs: number;
  public readonly _postgresStatementTimeoutMs: number;
  public readonly _postgresNetworkDiagnosticTimeoutMs: number;
  // # JWT
  public readonly _jwtAccessSecretKey: string;
  public readonly _jwtAccessExpiryTime: string;
  public readonly _jwtRefreshSecretKey: string;
  public readonly _jwtRefreshExpiryTime: string;
  public readonly _totpIssuer: string;
  public readonly _mfaTrustWindowMinutes: number;
  public readonly _passwordResetUrl?: string;
  public readonly _passwordResetTokenTtlMinutes: number;

  // # DATABASE
  // % DB_1
  public readonly _dbUrlOne?: string;
  public readonly _dbHostOne: string;
  public readonly _dbPortOne: number;
  public readonly _dbNameOne: string;
  public readonly _dbUserOne: string;
  public readonly _dbPasswordOne: string;
  public readonly _dbSslOne: boolean;

  // % DB_2
  public readonly _dbUrlTwo?: string;
  public readonly _dbHostTwo?: string;
  public readonly _dbPortTwo?: number;
  public readonly _dbNameTwo?: string;
  public readonly _dbUserTwo?: string;
  public readonly _dbPasswordTwo?: string;
  public readonly _dbSslTwo?: boolean;

  // % DB_3
  public readonly _dbUrlThree?: string;
  public readonly _dbHostThree?: string;
  public readonly _dbPortThree?: number;
  public readonly _dbNameThree?: string;
  public readonly _dbUserThree?: string;
  public readonly _dbPasswordThree?: string;
  public readonly _dbSslThree?: boolean;

  // # SERVICES
  public readonly _redisUrl: string;
  public readonly _mongoDbUrl: string;
  public readonly _emailProviderUrl?: string;
  public readonly _emailProviderApiKey?: string;
  public readonly _smsProviderUrl?: string;
  public readonly _smsProviderApiKey?: string;
  public readonly _pushProviderUrl?: string;
  public readonly _pushProviderApiKey?: string;
  public readonly _mongoAppLogsDb: string;
  public readonly _mongoActivitiesDb: string;
  public readonly _twilioAccountSid?: string;
  public readonly _twilioAuthToken?: string;
  public readonly _twilioSmsFrom?: string;
  public readonly _twilioWhatsappFrom?: string;
  public readonly _brevoApiKey?: string;
  public readonly _brevoFromEmail?: string;
  public readonly _geminiApiKey?: string;
  public readonly _openWeatherMapApiKey?: string;
  public readonly _fcmServerKey?: string;
  public readonly _razorpayKeyId?: string;
  public readonly _razorpayKeySecret?: string;
  public readonly _msg91AuthKey?: string;
  public readonly _cdnBaseUrl?: string;
  public readonly _redisWeatherTtl: number;
  public readonly _userActivityLogRetentionDays: number;
  public readonly _auditLogRetentionDays: number;
  public readonly _platformLogRetentionDays: number;


  private constructor(config: ReturnType<typeof EnvValidator.validate>) {
    // # SERVER
    this._environment = config.NODE_ENV;
    this._port = config.PORT;
    this._appBaseUrl = config.APP_BASE_URL;
    this._frontendBaseUrl = config.FRONTEND_BASE_URL;
    this._corsOrigins = config.CORS_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
    if (!this._corsOrigins.includes(config.FRONTEND_BASE_URL)) {
      this._corsOrigins = [...this._corsOrigins, config.FRONTEND_BASE_URL];
    }
    this._corsCredentials = config.CORS_CREDENTIALS;
    this._requestBodyLimit = config.REQUEST_BODY_LIMIT;
    this._resourceNamespace = config.RESOURCE_NAMESPACE ?? config.NODE_ENV;
    this._captchaEnabled = config.CAPTCHA_ENABLED;
    this._externalHttpTimeoutMs = config.EXTERNAL_HTTP_TIMEOUT_MS;
    this._postgresConnectionTimeoutMs = config.POSTGRES_CONNECTION_TIMEOUT_MS;
    this._postgresQueryTimeoutMs = config.POSTGRES_QUERY_TIMEOUT_MS;
    this._postgresStatementTimeoutMs = config.POSTGRES_STATEMENT_TIMEOUT_MS;
    this._postgresNetworkDiagnosticTimeoutMs =
      config.POSTGRES_NETWORK_DIAGNOSTIC_TIMEOUT_MS;

    // # JWT
    this._jwtAccessSecretKey = config.JWT_ACCESS_SECRET_KEY;
    this._jwtAccessExpiryTime = config.JWT_ACCESS_EXPIRY_TIME;
    this._jwtRefreshSecretKey = config.JWT_REFRESH_SECRET_KEY;
    this._jwtRefreshExpiryTime = config.JWT_REFRESH_EXPIRY_TIME;
    this._totpIssuer = config.TOTP_ISSUER;
    this._mfaTrustWindowMinutes = config.MFA_TRUST_WINDOW_MINUTES;
    this._passwordResetUrl = config.PASSWORD_RESET_URL;
    this._passwordResetTokenTtlMinutes =
      config.PASSWORD_RESET_TOKEN_TTL_MINUTES;

    // # DATABASE
    // % DB_1
    this._dbUrlOne = config._DB_URL_ONE;
    this._dbHostOne = config._DB_HOST_ONE;
    this._dbPortOne = config._DB_PORT_ONE;
    this._dbNameOne = config._DB_NAME_ONE;
    this._dbUserOne = config._DB_USER_ONE;
    this._dbPasswordOne = config._DB_PASSWORD_ONE;
    this._dbSslOne = config._DB_SSL_ONE;

    // % DB_2

    // % DB_3

    // # SERVICES
    this._redisUrl = config.REDIS_URL;
    this._mongoDbUrl = config.MONGODB_URL;
    this._emailProviderUrl = config.EMAIL_PROVIDER_URL;
    this._emailProviderApiKey = config.EMAIL_PROVIDER_API_KEY;
    this._smsProviderUrl = config.SMS_PROVIDER_URL;
    this._smsProviderApiKey = config.SMS_PROVIDER_API_KEY;
    this._pushProviderUrl = config.PUSH_PROVIDER_URL;
    this._pushProviderApiKey = config.PUSH_PROVIDER_API_KEY;
    this._mongoAppLogsDb = config.MONGODB_APP_LOGS_DB;
    this._mongoActivitiesDb = config.MONGODB_ACTIVITIES_DB;
    this._twilioAccountSid = config.TWILIO_ACCOUNT_SID;
    this._twilioAuthToken = config.TWILIO_AUTH_TOKEN;
    this._twilioSmsFrom = config.TWILIO_SMS_FROM;
    this._twilioWhatsappFrom = config.TWILIO_WHATSAPP_FROM;
    this._brevoApiKey = config.BREVO_API_KEY;
    this._brevoFromEmail = config.BREVO_FROM_EMAIL;
    this._geminiApiKey = config.GEMINI_API_KEY;
    this._openWeatherMapApiKey = config.OPENWEATHERMAP_API_KEY;
    this._fcmServerKey = config.FCM_SERVER_KEY;
    this._razorpayKeyId = config.RAZORPAY_KEY_ID;
    this._razorpayKeySecret = config.RAZORPAY_KEY_SECRET;
    this._msg91AuthKey = config.MSG91_AUTH_KEY;
    this._cdnBaseUrl = config.CDN_BASE_URL;
    this._redisWeatherTtl = config.REDIS_WEATHER_TTL;
    this._userActivityLogRetentionDays =
      config.USER_ACTIVITY_LOG_RETENTION_DAYS;
    this._auditLogRetentionDays = config.AUDIT_LOG_RETENTION_DAYS;
    this._platformLogRetentionDays = config.PLATFORM_LOG_RETENTION_DAYS;

  }

  // 🔒 Singleton accessor
  public static getInstance(): Env {
    if (!Env.instance) {
      const validatedConfig = EnvValidator.validate(process.env);
      Env.instance = new Env(validatedConfig);
    }
    return Env.instance;
  }

  private buildDbOptions(
    connectionUrl: string | undefined,
    host: string,
    port: number,
    user: string,
    password: string,
    dbName: string,
    ssl: boolean,
  ): PostgresConnectionOptions {
    const urlSource = connectionUrl ?? (this.isPostgresUrl(host) ? host : undefined);

    if (urlSource) {
      return this.buildDbOptionsFromUrl(urlSource, ssl);
    }

    this.assertDbParts(host, user, password, dbName);
    const parsedHost = this.parseHost(host, port);

    return {
      host: parsedHost.host,
      port: parsedHost.port,
      database: dbName,
      user,
      password,
      ssl,
    };
  }

  private buildDbOptionsFromUrl(
    connectionUrl: string,
    defaultSsl: boolean,
  ): PostgresConnectionOptions {
    const parsedUrl = new URL(connectionUrl);
    const database = decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ""));
    const sslMode = parsedUrl.searchParams.get("sslmode");
    const ssl = sslMode ? sslMode !== "disable" : defaultSsl;

    return {
      connectionString: connectionUrl,
      host: parsedUrl.hostname,
      port: parsedUrl.port ? Number(parsedUrl.port) : 5432,
      database,
      user: decodeURIComponent(parsedUrl.username),
      password: decodeURIComponent(parsedUrl.password),
      ssl,
    };
  }

  private parseHost(host: string, fallbackPort: number): { host: string; port: number } {
    if (!host.includes(":") || host.includes("://")) {
      return { host, port: fallbackPort };
    }

    const parsedUrl = new URL(`postgresql://${host}`);
    return {
      host: parsedUrl.hostname,
      port: parsedUrl.port ? Number(parsedUrl.port) : fallbackPort,
    };
  }

  private isPostgresUrl(value: string): boolean {
    return value.startsWith("postgres://") || value.startsWith("postgresql://");
  }

  private assertDbParts(
    host: string,
    user: string,
    password: string,
    dbName: string,
  ): void {
    if (!host || !user || !password || !dbName) {
      throw new Error(
        "Postgres config requires DB URL or host/name/user/password.",
      );
    }
  }

  public get db1Options(): PostgresConnectionOptions {
    return this.buildDbOptions(
      this._dbUrlOne,
      this._dbHostOne,
      this._dbPortOne,
      this._dbUserOne,
      this._dbPasswordOne,
      this._dbNameOne,
      this._dbSslOne,
    );
  }

  public get db1Ssl(): boolean {
    return this._dbSslOne;
  }

  public get redisUrl(): string {
    return this._redisUrl;
  }

  public get appBaseUrl(): string {
    return this._appBaseUrl ?? `http://localhost:${this._port}`;
  }

  public get frontendBaseUrl(): string {
    return this._frontendBaseUrl;
  }

  public get corsOrigins(): readonly string[] {
    return this._corsOrigins;
  }

  public get corsCredentials(): boolean {
    return this._corsCredentials;
  }

  public get requestBodyLimit(): string {
    return this._requestBodyLimit;
  }

  public get resourceNamespace(): string {
    return this._resourceNamespace;
  }

  public get captchaEnabled(): boolean {
    return this._captchaEnabled;
  }

  public get externalHttpTimeoutMs(): number {
    return this._externalHttpTimeoutMs;
  }

  public get postgresConnectionTimeoutMs(): number {
    return this._postgresConnectionTimeoutMs;
  }

  public get postgresQueryTimeoutMs(): number {
    return this._postgresQueryTimeoutMs;
  }

  public get postgresStatementTimeoutMs(): number {
    return this._postgresStatementTimeoutMs;
  }

  public get postgresNetworkDiagnosticTimeoutMs(): number {
    return this._postgresNetworkDiagnosticTimeoutMs;
  }

  public get jwtAccessSecretKey(): string {
    return this._jwtAccessSecretKey;
  }

  public get jwtAccessExpiryTime(): string {
    return this._jwtAccessExpiryTime;
  }

  public get jwtRefreshSecretKey(): string {
    return this._jwtRefreshSecretKey;
  }

  public get jwtRefreshExpiryTime(): string {
    return this._jwtRefreshExpiryTime;
  }

  public get totpIssuer(): string {
    return this._totpIssuer;
  }

  public get mfaTrustWindowMinutes(): number {
    return this._mfaTrustWindowMinutes;
  }

  public get passwordResetUrl(): string | undefined {
    return this._passwordResetUrl;
  }

  public get passwordResetTokenTtlMinutes(): number {
    return this._passwordResetTokenTtlMinutes;
  }

  public get mongoDbUrl(): string {
    return this._mongoDbUrl;
  }

  public get emailProviderUrl(): string | undefined {
    return this._emailProviderUrl;
  }

  public get emailProviderApiKey(): string | undefined {
    return this._emailProviderApiKey;
  }

  public get smsProviderUrl(): string | undefined {
    return this._smsProviderUrl;
  }

  public get smsProviderApiKey(): string | undefined {
    return this._smsProviderApiKey;
  }

  public get pushProviderUrl(): string | undefined {
    return this._pushProviderUrl;
  }

  public get pushProviderApiKey(): string | undefined {
    return this._pushProviderApiKey;
  }

  public get mongoAppLogsDb(): string {
    return this._mongoAppLogsDb;
  }

  public get mongoActivitiesDb(): string {
    return this._mongoActivitiesDb;
  }

  public get twilioAccountSid(): string | undefined {
    return this._twilioAccountSid;
  }

  public get twilioAuthToken(): string | undefined {
    return this._twilioAuthToken;
  }

  public get twilioSmsFrom(): string | undefined {
    return this._twilioSmsFrom;
  }

  public get twilioWhatsappFrom(): string | undefined {
    return this._twilioWhatsappFrom;
  }

  public get brevoApiKey(): string | undefined {
    return this._brevoApiKey;
  }

  public get brevoFromEmail(): string | undefined {
    return this._brevoFromEmail;
  }

  public get geminiApiKey(): string | undefined {
    return this._geminiApiKey;
  }

  public get openWeatherMapApiKey(): string | undefined {
    return this._openWeatherMapApiKey;
  }

  public get fcmServerKey(): string | undefined {
    return this._fcmServerKey;
  }

  public get razorpayKeyId(): string | undefined {
    return this._razorpayKeyId;
  }

  public get razorpayKeySecret(): string | undefined {
    return this._razorpayKeySecret;
  }

  public get msg91AuthKey(): string | undefined {
    return this._msg91AuthKey;
  }

  public get cdnBaseUrl(): string | undefined {
    return this._cdnBaseUrl;
  }

  public get redisWeatherTtl(): number {
    return this._redisWeatherTtl;
  }

  public get userActivityLogRetentionDays(): number {
    return this._userActivityLogRetentionDays;
  }

  public get auditLogRetentionDays(): number {
    return this._auditLogRetentionDays;
  }

  public get platformLogRetentionDays(): number {
    return this._platformLogRetentionDays;
  }

  public get port(): number {
    return this._port;
  }

  public get isEnvironmentDevelopment(): boolean {
    return this._environment === "development";
  }

  public get isEnvironmentProduction(): boolean {
    return this._environment === "production";
  }




}

// ✅ Export singleton instance
export const env = Env.getInstance();
