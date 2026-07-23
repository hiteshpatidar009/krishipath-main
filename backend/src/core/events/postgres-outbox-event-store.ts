import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";

import { Db1Connection } from "../../infrastructure/database";
import { SqlResult } from "../../shared/db/sql-result";
import { EventEnvelope } from "./event-envelope";
import { OutboxEventRecord, OutboxEventStore } from "./outbox-event-store";

export class PostgresOutboxEventStore implements OutboxEventStore {
  private readonly eventIdToRecordId = new Map<string, string>();

  public async append(event: EventEnvelope): Promise<void> {
    const recordId = this.isUuid(event.id) ? event.id : randomUUID();
    this.eventIdToRecordId.set(event.id, recordId);

    await Db1Connection.getInstance().execute(sql`
      INSERT INTO event_outbox (
        id, aggregate_type, aggregate_id, event_type, payload, status,
        retry_count, created_at
      ) VALUES (
        ${recordId},
        ${event.source},
        ${this.isUuid(event.id) ? event.id : null},
        ${event.name},
        ${JSON.stringify({ ...event, originalEventId: event.id })}::jsonb,
        'pending',
        0,
        NOW()
      )
    `);
  }

  public async markPublished(eventId: string): Promise<void> {
    await this.updateStatus(eventId, "published");
  }

  public async markFailed(eventId: string, reason: string): Promise<void> {
    const recordId = this.resolveRecordId(eventId);
    await Db1Connection.getInstance().execute(sql`
      UPDATE event_outbox
      SET status = 'failed',
          retry_count = COALESCE(retry_count, 0) + 1,
          processed_at = NOW(),
          payload = payload || ${JSON.stringify({ failureReason: reason })}::jsonb
      WHERE id = ${recordId}
    `);
  }

  public async listPending(limit: number): Promise<readonly OutboxEventRecord[]> {
    const result = await Db1Connection.getInstance().execute(sql`
      SELECT id, event_type, payload, status, created_at, processed_at
      FROM event_outbox
      WHERE status = 'pending'
      ORDER BY created_at ASC
      LIMIT ${limit}
    `);

    return SqlResult.rows<{
      id: string;
      payload: EventEnvelope;
      status: "pending" | "published" | "failed";
      created_at: Date;
      processed_at?: Date;
    }>(result).map((row) => ({
      id: row.id,
      event: row.payload,
      status: row.status,
      createdAt: row.created_at,
      publishedAt: row.processed_at,
    }));
  }

  private async updateStatus(eventId: string, status: string): Promise<void> {
    await Db1Connection.getInstance().execute(sql`
      UPDATE event_outbox
      SET status = ${status}, processed_at = NOW()
      WHERE id = ${this.resolveRecordId(eventId)}
    `);
  }

  private resolveRecordId(eventId: string): string {
    return this.eventIdToRecordId.get(eventId) ?? eventId;
  }

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }
}
