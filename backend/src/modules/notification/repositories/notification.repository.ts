import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { SqlResult } from "../../../shared/db/sql-result";
import { NotificationDto } from "../dto/notification.dto";
import { TemplateDto } from "../dto/template.dto";

export class NotificationRepository {
  public async create(dto: NotificationDto): Promise<string> {
    const id = randomUUID();
    await Db1Connection.getInstance().execute(sql`
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

  public async markSent(id: string, providerMessageId?: string): Promise<void> {
    await Db1Connection.getInstance().execute(sql`
      UPDATE notifications
      SET priority = ${providerMessageId ? "sent" : "normal"}
      WHERE id = ${id}
    `);
  }

  public async markFailed(id: string, message: string): Promise<void> {
    await Db1Connection.getInstance().execute(sql`
      UPDATE notifications
      SET priority = ${`failed:${message.slice(0, 80)}`}
      WHERE id = ${id}
    `);
  }

  public async list(
    companyId: string,
    userId: string,
    limit: number,
    offset: number,
  ): Promise<unknown[]> {
    const result = await Db1Connection.getInstance().execute(sql`
      SELECT id, company_id, user_id, type, channel, title, message,
             entity_type, entity_id, priority, is_read, read_at, created_at
      FROM notifications
      WHERE company_id = ${companyId} AND user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);
    return SqlResult.rows<unknown>(result);
  }

  public async createTemplate(dto: TemplateDto): Promise<string> {
    const id = randomUUID();
    await Db1Connection.getInstance().execute(sql`
      INSERT INTO notification_templates (id, company_id, template_name, notification_type, subject, body, created_at)
      VALUES (${id}, ${dto.companyId}, ${dto.templateKey}, ${dto.channel}, ${dto.subject ?? null}, ${dto.body}, NOW())
    `);
    return id;
  }

  public async listTemplates(
    companyId: string,
    limit: number,
    offset: number,
  ): Promise<unknown[]> {
    const result = await Db1Connection.getInstance().execute(sql`
      SELECT id, company_id, template_name, notification_type, subject, body, created_at
      FROM notification_templates
      WHERE company_id = ${companyId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);
    return SqlResult.rows<unknown>(result);
  }
}
