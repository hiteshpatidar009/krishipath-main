import { AuthDatabaseClient } from "../setup/auth-database-client";
import { AuthRedisClient } from "../setup/auth-redis-client";
import { AuthTestLogger } from "../utils/auth-test-logger";

export class AuthCleanupEngine {
  constructor(
    private readonly database: AuthDatabaseClient,
    private readonly redis: AuthRedisClient,
    private readonly logger: AuthTestLogger,
  ) {}

  public async run(): Promise<void> {
    this.logger.info("cleanup started");

    await this.database.deleteAllIfExists("mfa_trust_sessions");
    await this.database.deleteAllIfExists("sessions");
    await this.database.deleteAllIfExists("login_attempts");
    await this.database.deleteAllIfExists("backup_codes");
    await this.database.deleteAllIfExists("mfa_devices");
    await this.database.deleteAllIfExists("password_reset_tokens");
    await this.database.deleteAllIfExists("email_verification_tokens");
    await this.database.deleteAllIfExists("user_devices");
    await this.database.deleteAllIfExists("idempotency_keys");
    await this.database.deleteAllIfExists("background_jobs");
    await this.database.deleteAllIfExists("event_outbox");

    await this.database.query(
      [
        "delete from role_permissions",
        "where role_id in (",
        "select id from roles where company_id in (",
        "select id from companies where name like 'Auth Test %'",
        ")",
        ")",
      ].join(" "),
    );
    await this.database.query(
      [
        "delete from user_roles",
        "where user_id in (select id from users where email like 'auth.%@example.test')",
        "or role_id in (",
        "select id from roles where company_id in (",
        "select id from companies where name like 'Auth Test %'",
        ")",
        ")",
      ].join(" "),
    );
    await this.database.query(
      "delete from roles where company_id in (select id from companies where name like 'Auth Test %')",
    );
    await this.database.query(
      "delete from subscriptions where user_id in (select id from users where email like 'auth.%@example.test')",
    );
    await this.database.query(
      "delete from company_settings where company_id in (select id from companies where name like 'Auth Test %')",
    );
    await this.database.query(
      "delete from users where email like 'auth.%@example.test'",
    );
    await this.database.query(
      "delete from companies where name like 'Auth Test %'",
    );

    const redisDeleted = await this.redis.clearAuthState();
    this.logger.info("cleanup completed", { redisDeleted });
  }
}
