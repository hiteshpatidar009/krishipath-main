import { createHash, randomUUID } from "crypto";
import { sql } from "drizzle-orm";

import { Db1Connection } from "../../infrastructure/database";
import { SqlResult } from "../../shared/db/sql-result";

export interface IdempotencyRecord {
  readonly requestHash: string;
  readonly responseSnapshot?: unknown;
  readonly status?: string;
  readonly statusCode?: number;
}

export class IdempotencyService {
  public hashRequest(input: unknown): string {
    return createHash("sha256")
      .update(JSON.stringify(input))
      .digest("hex");
  }

  public async get(
    companyId: string | undefined,
    key: string,
  ): Promise<IdempotencyRecord | null> {
    const result = await Db1Connection.getInstance().execute(sql`
      SELECT request_hash, response_snapshot
      FROM idempotency_keys
      WHERE idempotency_key = ${key}
        AND (${companyId ?? null}::uuid IS NULL OR company_id = ${companyId ?? null})
        AND expires_at > NOW()
      LIMIT 1
    `);
    const row = SqlResult.rows<{
      request_hash: string;
      response_snapshot?: unknown;
    }>(result)[0];
    if (!row) {
      return null;
    }
    const snapshot = row.response_snapshot as
      | { __idempotency?: boolean; statusCode?: number; body?: unknown }
      | undefined;
    const hasCompletedSnapshot = row.response_snapshot !== null && row.response_snapshot !== undefined;
    return {
      requestHash: row.request_hash,
      responseSnapshot: snapshot?.__idempotency ? snapshot.body : row.response_snapshot,
      status: hasCompletedSnapshot ? "completed" : "in_progress",
      statusCode: snapshot?.__idempotency ? snapshot.statusCode : 200,
    };
  }

  public async reserveExecution(
    companyId: string | undefined,
    key: string,
    requestHash: string,
    ttlMinutes = 60,
  ): Promise<
    | { state: "reserved" }
    | { state: "conflict" }
    | { state: "in_progress" }
    | { state: "failed" }
    | { state: "completed"; statusCode: number; responseSnapshot: unknown }
  > {
    const inserted = await Db1Connection.getInstance().execute(sql`
      INSERT INTO idempotency_keys (
        id, company_id, idempotency_key, request_hash, expires_at, created_at
      ) VALUES (
        ${randomUUID()}, ${companyId ?? null}, ${key}, ${requestHash},
        NOW() + (${ttlMinutes} || ' minutes')::interval, NOW()
      )
      ON CONFLICT (idempotency_key) DO NOTHING
      RETURNING id
    `);

    if (SqlResult.rows(inserted).length > 0) {
      return { state: "reserved" };
    }

    const existing = await this.get(companyId, key);
    if (!existing || existing.requestHash !== requestHash) {
      return { state: "conflict" };
    }

    if (existing.status === "completed") {
      return {
        state: "completed",
        statusCode: existing.statusCode ?? 200,
        responseSnapshot: existing.responseSnapshot,
      };
    }

    if (existing.status === "failed") {
      return { state: "failed" };
    }

    return { state: "in_progress" };
  }

  public async reserve(
    companyId: string | undefined,
    key: string,
    requestHash: string,
    ttlMinutes = 60,
  ): Promise<void> {
    await Db1Connection.getInstance().execute(sql`
      INSERT INTO idempotency_keys (
        id, company_id, idempotency_key, request_hash, expires_at, created_at
      ) VALUES (
        ${randomUUID()}, ${companyId ?? null}, ${key}, ${requestHash},
        NOW() + (${ttlMinutes} || ' minutes')::interval, NOW()
      )
      ON CONFLICT (idempotency_key) DO NOTHING
    `);
  }

  public async complete(
    companyId: string | undefined,
    key: string,
    requestHash: string,
    statusCode: number,
    responseSnapshot: unknown,
  ): Promise<void> {
    await Db1Connection.getInstance().execute(sql`
      UPDATE idempotency_keys
      SET response_snapshot = ${JSON.stringify({
        __idempotency: true,
        statusCode,
        body: responseSnapshot,
      })}::jsonb
      WHERE idempotency_key = ${key}
        AND request_hash = ${requestHash}
        AND (${companyId ?? null}::uuid IS NULL OR company_id = ${companyId ?? null})
    `);
  }

  public async fail(
    companyId: string | undefined,
    key: string,
    requestHash: string,
  ): Promise<void> {
    await Db1Connection.getInstance().execute(sql`
      DELETE FROM idempotency_keys
      WHERE idempotency_key = ${key}
        AND request_hash = ${requestHash}
        AND (${companyId ?? null}::uuid IS NULL OR company_id = ${companyId ?? null})
    `);
  }

  public async retryFailed(
    companyId: string | undefined,
    key: string,
    requestHash: string,
    _ttlMinutes = 60,
  ): Promise<boolean> {
    const result = await Db1Connection.getInstance().execute(sql`
      DELETE FROM idempotency_keys
      WHERE idempotency_key = ${key}
        AND request_hash = ${requestHash}
        AND (${companyId ?? null}::uuid IS NULL OR company_id = ${companyId ?? null})
      RETURNING id
    `);
    return SqlResult.rows(result).length > 0;
  }
}
