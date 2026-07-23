import pg from "pg";
import dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import { AuthDbCounts, AuthDbPlan } from "../utils/auth-test.types";

dotenv.config();

export class AuthDatabaseClient {
  private readonly pool: pg.Pool;

  constructor() {
    this.pool = new pg.Pool({
      host: envValue("_DB_HOST_ONE"),
      port: Number(envValue("_DB_PORT_ONE", "5432")),
      database: envValue("_DB_NAME_ONE"),
      user: envValue("_DB_USER_ONE"),
      password: envValue("_DB_PASSWORD_ONE"),
      ssl: envValue("_DB_SSL_ONE", "false") === "true"
        ? { rejectUnauthorized: false }
        : false,
      connectionTimeoutMillis: 30_000,
      idleTimeoutMillis: 5_000,
      max: 5,
    });
  }

  public async query<T extends pg.QueryResultRow = pg.QueryResultRow>(
    text: string,
    values: unknown[] = [],
  ): Promise<T[]> {
    const result = await this.pool.query<T>(text, values);
    return result.rows;
  }

  public async findPlan(preferredCode?: string): Promise<AuthDbPlan | undefined> {
    if (preferredCode) {
      const preferred = await this.query<AuthDbPlan>(
        "select id, code, name from subscription_plans where code = $1 limit 1",
        [preferredCode],
      );
      if (preferred[0]) {
        return preferred[0];
      }
    }

    const rows = await this.query<AuthDbPlan>(
      [
        "select id, code, name from subscription_plans",
        "order by",
        "case when code in ('free_tier', 'trial', 'starter') then 0 else 1 end,",
        "code asc",
        "limit 1",
      ].join(" "),
    );
    return rows[0];
  }

  public async countState(): Promise<AuthDbCounts> {
    return {
      sessions: await this.tableCount("sessions"),
      loginAttempts: await this.tableCount("login_attempts"),
      mfaDevices: await this.tableCount("mfa_devices"),
      passwordResetTokens: await this.tableCount("password_reset_tokens"),
      auditLogs: await this.tableCount("audit_logs"),
      activityLogs: await this.tableCount("activity_logs"),
      notifications: await this.tableCount("notifications"),
      outboxEvents: await this.tableCount("event_outbox"),
    };
  }

  public async deleteAllIfExists(tableName: string): Promise<void> {
    const exists = await this.tableExists(tableName);
    if (!exists) {
      return;
    }
    await this.query(`delete from ${tableName}`);
  }

  public async latestPasswordResetTokenId(userId: string): Promise<string | undefined> {
    const rows = await this.query<{ id: string }>(
      [
        "select id from password_reset_tokens",
        "where user_id = $1",
        "order by created_at desc",
        "limit 1",
      ].join(" "),
      [userId],
    );
    return rows[0]?.id;
  }

  public async expirePasswordResetToken(tokenId: string): Promise<void> {
    await this.query(
      "update password_reset_tokens set expires_at = now() - interval '1 minute' where id = $1",
      [tokenId],
    );
  }

  public async latestPasswordResetSessionId(userId: string): Promise<string | undefined> {
    const rows = await this.query<{ id: string }>(
      [
        "select id from password_reset_sessions",
        "where user_id = $1",
        "order by created_at desc",
        "limit 1",
      ].join(" "),
      [userId],
    );
    return rows[0]?.id;
  }

  public async expirePasswordResetSession(sessionId: string): Promise<void> {
    await this.query(
      "update password_reset_sessions set expires_at = now() - interval '1 minute' where id = $1",
      [sessionId],
    );
  }

  public async expireSession(sessionId: string): Promise<void> {
    await this.query(
      "update sessions set expires_at = now() - interval '1 minute' where id = $1",
      [sessionId],
    );
  }

  public async updateUserStatus(userId: string, status: string): Promise<void> {
    await this.query("update users set status = $2, updated_at = now() where id = $1", [
      userId,
      status,
    ]);
  }

  public async setUserVerifiedForSecurityProbe(userId: string): Promise<void> {
    await this.query(
      "update users set is_email_verified = true, is_mfa_enabled = true, status = 'active', updated_at = now() where id = $1",
      [userId],
    );
  }

  public async configureAuthAppMfa(
    userId: string,
    encryptedSecret: string,
  ): Promise<void> {
    await this.query(
      [
        "insert into mfa_devices",
        "(id, user_id, mfa_type, secret_hash, is_primary, verified_at, created_at)",
        "values ($1, $2, 'auth_app_otp', $3, true, now(), now())",
        "on conflict do nothing",
      ].join(" "),
      [randomUUID(), userId, encryptedSecret],
    );
    await this.query(
      "update users set is_email_verified = true, is_mfa_enabled = true, status = 'active', updated_at = now() where id = $1",
      [userId],
    );
  }

  public async disconnect(): Promise<void> {
    await this.pool.end();
  }

  private async tableCount(tableName: string): Promise<number> {
    if (!(await this.tableExists(tableName))) {
      return 0;
    }

    const rows = await this.query<{ count: string }>(
      `select count(*)::text as count from ${tableName}`,
    );
    return Number(rows[0]?.count ?? 0);
  }

  private async tableExists(tableName: string): Promise<boolean> {
    const exists = await this.query<{ exists: string | null }>(
      "select to_regclass($1) as exists",
      [tableName],
    );
    return Boolean(exists[0]?.exists);
  }
}

function envValue(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}
