import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { SqlResult } from "../../../shared/db/sql-result";
export class NotificationRepository {
    async create(dto) {
        const id = randomUUID();
        await Db1Connection.getInstance().execute(sql `
      INSERT INTO notifications (
        id, company_id, user_id, type, channel, title,
        message, entity_type, priority, is_read, created_at
      ) VALUES (
        ${id}, ${dto.companyId}, ${dto.userId ?? null}, ${dto.templateKey ?? "notification"},
        ${dto.channel}, ${dto.subject ?? dto.templateKey ?? "Notification"},
        ${dto.body}, ${dto.recipient}, 'normal', false, NOW()
      )
    `);
        return id;
    }
    async markSent(id, providerMessageId) {
        await Db1Connection.getInstance().execute(sql `
      UPDATE notifications
      SET priority = ${providerMessageId ? "sent" : "normal"}
      WHERE id = ${id}
    `);
    }
    async markFailed(id, message) {
        await Db1Connection.getInstance().execute(sql `
      UPDATE notifications
      SET priority = ${`failed:${message.slice(0, 80)}`}
      WHERE id = ${id}
    `);
    }
    async list(companyId, userId, limit, offset) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT id, company_id, user_id, type, channel, title, message,
             entity_type, entity_id, priority, is_read, read_at, created_at
      FROM notifications
      WHERE company_id = ${companyId} AND user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);
        return SqlResult.rows(result);
    }
    async createTemplate(dto) {
        const id = randomUUID();
        await Db1Connection.getInstance().execute(sql `
      INSERT INTO notification_templates (id, company_id, template_name, notification_type, subject, body, created_at)
      VALUES (${id}, ${dto.companyId}, ${dto.templateKey}, ${dto.channel}, ${dto.subject ?? null}, ${dto.body}, NOW())
    `);
        return id;
    }
    async listTemplates(companyId, limit, offset) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT id, company_id, template_name, notification_type, subject, body, created_at
      FROM notification_templates
      WHERE company_id = ${companyId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);
        return SqlResult.rows(result);
    }
}
