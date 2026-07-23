import dotenv from "dotenv";
import { EnvValidator } from "./validate_env";
dotenv.config();
class Env {
    static instance;
    // # SERVER
    _environment;
    _port;
    _appBaseUrl;
    _frontendBaseUrl;
    _corsOrigins;
    _corsCredentials;
    _requestBodyLimit;
    _resourceNamespace;
    _captchaEnabled;
    _externalHttpTimeoutMs;
    _postgresConnectionTimeoutMs;
    _postgresQueryTimeoutMs;
    _postgresStatementTimeoutMs;
    _postgresNetworkDiagnosticTimeoutMs;
    // # JWT
    _jwtAccessSecretKey;
    _jwtAccessExpiryTime;
    _jwtRefreshSecretKey;
    _jwtRefreshExpiryTime;
    _totpIssuer;
    _mfaTrustWindowMinutes;
    _passwordResetUrl;
    _passwordResetTokenTtlMinutes;
    // # DATABASE
    // % DB_1
    _dbUrlOne;
    _dbHostOne;
    _dbPortOne;
    _dbNameOne;
    _dbUserOne;
    _dbPasswordOne;
    _dbSslOne;
    // % DB_2
    _dbUrlTwo;
    _dbHostTwo;
    _dbPortTwo;
    _dbNameTwo;
    _dbUserTwo;
    _dbPasswordTwo;
    _dbSslTwo;
    // % DB_3
    _dbUrlThree;
    _dbHostThree;
    _dbPortThree;
    _dbNameThree;
    _dbUserThree;
    _dbPasswordThree;
    _dbSslThree;
    // # SERVICES
    _redisUrl;
    _mongoDbUrl;
    _emailProviderUrl;
    _emailProviderApiKey;
    _smsProviderUrl;
    _smsProviderApiKey;
    _pushProviderUrl;
    _pushProviderApiKey;
    _mongoAppLogsDb;
    _mongoActivitiesDb;
    _twilioAccountSid;
    _twilioAuthToken;
    _twilioSmsFrom;
    _twilioWhatsappFrom;
    _brevoApiKey;
    _brevoFromEmail;
    _geminiApiKey;
    _openWeatherMapApiKey;
    _fcmServerKey;
    _razorpayKeyId;
    _razorpayKeySecret;
    _msg91AuthKey;
    _cdnBaseUrl;
    _redisWeatherTtl;
    _userActivityLogRetentionDays;
    _auditLogRetentionDays;
    _platformLogRetentionDays;
    constructor(config) {
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
    static getInstance() {
        if (!Env.instance) {
            const validatedConfig = EnvValidator.validate(process.env);
            Env.instance = new Env(validatedConfig);
        }
        return Env.instance;
    }
    buildDbOptions(connectionUrl, host, port, user, password, dbName, ssl) {
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
    buildDbOptionsFromUrl(connectionUrl, defaultSsl) {
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
    parseHost(host, fallbackPort) {
        if (!host.includes(":") || host.includes("://")) {
            return { host, port: fallbackPort };
        }
        const parsedUrl = new URL(`postgresql://${host}`);
        return {
            host: parsedUrl.hostname,
            port: parsedUrl.port ? Number(parsedUrl.port) : fallbackPort,
        };
    }
    isPostgresUrl(value) {
        return value.startsWith("postgres://") || value.startsWith("postgresql://");
    }
    assertDbParts(host, user, password, dbName) {
        if (!host || !user || !password || !dbName) {
            throw new Error("Postgres config requires DB URL or host/name/user/password.");
        }
    }
    get db1Options() {
        return this.buildDbOptions(this._dbUrlOne, this._dbHostOne, this._dbPortOne, this._dbUserOne, this._dbPasswordOne, this._dbNameOne, this._dbSslOne);
    }
    get db1Ssl() {
        return this._dbSslOne;
    }
    get redisUrl() {
        return this._redisUrl;
    }
    get appBaseUrl() {
        return this._appBaseUrl ?? `http://localhost:${this._port}`;
    }
    get frontendBaseUrl() {
        return this._frontendBaseUrl;
    }
    get corsOrigins() {
        return this._corsOrigins;
    }
    get corsCredentials() {
        return this._corsCredentials;
    }
    get requestBodyLimit() {
        return this._requestBodyLimit;
    }
    get resourceNamespace() {
        return this._resourceNamespace;
    }
    get captchaEnabled() {
        return this._captchaEnabled;
    }
    get externalHttpTimeoutMs() {
        return this._externalHttpTimeoutMs;
    }
    get postgresConnectionTimeoutMs() {
        return this._postgresConnectionTimeoutMs;
    }
    get postgresQueryTimeoutMs() {
        return this._postgresQueryTimeoutMs;
    }
    get postgresStatementTimeoutMs() {
        return this._postgresStatementTimeoutMs;
    }
    get postgresNetworkDiagnosticTimeoutMs() {
        return this._postgresNetworkDiagnosticTimeoutMs;
    }
    get jwtAccessSecretKey() {
        return this._jwtAccessSecretKey;
    }
    get jwtAccessExpiryTime() {
        return this._jwtAccessExpiryTime;
    }
    get jwtRefreshSecretKey() {
        return this._jwtRefreshSecretKey;
    }
    get jwtRefreshExpiryTime() {
        return this._jwtRefreshExpiryTime;
    }
    get totpIssuer() {
        return this._totpIssuer;
    }
    get mfaTrustWindowMinutes() {
        return this._mfaTrustWindowMinutes;
    }
    get passwordResetUrl() {
        return this._passwordResetUrl;
    }
    get passwordResetTokenTtlMinutes() {
        return this._passwordResetTokenTtlMinutes;
    }
    get mongoDbUrl() {
        return this._mongoDbUrl;
    }
    get emailProviderUrl() {
        return this._emailProviderUrl;
    }
    get emailProviderApiKey() {
        return this._emailProviderApiKey;
    }
    get smsProviderUrl() {
        return this._smsProviderUrl;
    }
    get smsProviderApiKey() {
        return this._smsProviderApiKey;
    }
    get pushProviderUrl() {
        return this._pushProviderUrl;
    }
    get pushProviderApiKey() {
        return this._pushProviderApiKey;
    }
    get mongoAppLogsDb() {
        return this._mongoAppLogsDb;
    }
    get mongoActivitiesDb() {
        return this._mongoActivitiesDb;
    }
    get twilioAccountSid() {
        return this._twilioAccountSid;
    }
    get twilioAuthToken() {
        return this._twilioAuthToken;
    }
    get twilioSmsFrom() {
        return this._twilioSmsFrom;
    }
    get twilioWhatsappFrom() {
        return this._twilioWhatsappFrom;
    }
    get brevoApiKey() {
        return this._brevoApiKey;
    }
    get brevoFromEmail() {
        return this._brevoFromEmail;
    }
    get geminiApiKey() {
        return this._geminiApiKey;
    }
    get openWeatherMapApiKey() {
        return this._openWeatherMapApiKey;
    }
    get fcmServerKey() {
        return this._fcmServerKey;
    }
    get razorpayKeyId() {
        return this._razorpayKeyId;
    }
    get razorpayKeySecret() {
        return this._razorpayKeySecret;
    }
    get msg91AuthKey() {
        return this._msg91AuthKey;
    }
    get cdnBaseUrl() {
        return this._cdnBaseUrl;
    }
    get redisWeatherTtl() {
        return this._redisWeatherTtl;
    }
    get userActivityLogRetentionDays() {
        return this._userActivityLogRetentionDays;
    }
    get auditLogRetentionDays() {
        return this._auditLogRetentionDays;
    }
    get platformLogRetentionDays() {
        return this._platformLogRetentionDays;
    }
    get port() {
        return this._port;
    }
    get isEnvironmentDevelopment() {
        return this._environment === "development";
    }
    get isEnvironmentProduction() {
        return this._environment === "production";
    }
}
// ✅ Export singleton instance
export const env = Env.getInstance();
