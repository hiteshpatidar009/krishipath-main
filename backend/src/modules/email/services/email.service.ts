import { RetryEngine } from "../../../core";
import { env } from "../../../infrastructure/config/env";
import { logger } from "../../../infrastructure/logger";
import { AppError } from "../../../shared/errors/app.error";
import { EmailDto } from "../dto/email.dto";
import { MongoNotificationLogRepository } from "../../../infrastructure/database/mongodb/repositories/notification-log.repository";

export class EmailService {
  private readonly enabled: boolean;
  private readonly retryEngine = new RetryEngine();
  private readonly notificationLogRepo = new MongoNotificationLogRepository();

  constructor() {
    this.enabled = Boolean(env.brevoApiKey && env.brevoFromEmail);
  }

  public async send(
    dto: EmailDto,
  ): Promise<{ messageId: string; status: string }> {
    if (!this.enabled) {
      if (env.isEnvironmentProduction) {
        throw new AppError(
          "Brevo not configured",
          503,
          "BREVO_NOT_CONFIGURED",
        );
      }

      const messageId = `dev-email-${Date.now().toString()}`;
      await logger.warn("Email provider not configured, simulated send", {
        module: "email.service",
        companyId: dto.companyId,
        userId: dto.userId,
        tags: ["email", "simulated"],
        payload: { messageId, to: dto.to, subject: dto.subject, body: dto.body },
      });

      // ── Save simulated email to MongoDB ──────────────────────────────────────
      this.notificationLogRepo
        .create({
          type: "email",
          to: dto.to,
          message: dto.body,
          subject: dto.subject,
          htmlBody: dto.htmlBody,
          channel: "email",
          status: "simulated",
          provider: "brevo",
          messageId,
          companyId: dto.companyId,
          userId: dto.userId,
        })
        .catch((err: unknown) =>
          logger.error(
            err instanceof Error ? err : new Error(String(err)),
            { module: "email.service", tags: ["notification_log", "mongo"] },
          ),
        );
      // ─────────────────────────────────────────────────────────────────────────

      return { messageId, status: "accepted" };
    }

    const send = async () => {
      const payload: any = {
        sender: { email: String(env.brevoFromEmail) },
        to: [{ email: dto.to }],
        subject: dto.subject,
        htmlContent: dto.htmlBody ?? dto.body,
        textContent: dto.body,
      };

      if (dto.attachments?.length) {
        payload.attachment = dto.attachments.map((att) => ({
          content: att.content,
          name: att.filename,
        }));
      }

      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "api-key": String(env.brevoApiKey),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Brevo API Error: ${response.status} ${errorData}`);
      }

      return await response.json();
    };

    const result =
      dto.singleAttempt ?
        await send()
      : await this.retryEngine.execute(send, {
          attempts: 3,
          baseDelayMs: 250,
          maxDelayMs: 2000,
        });

    const messageId = String(
      result?.messageId ?? `brevo-${Date.now().toString()}`,
    );

    await logger.info("Email sent", {
      module: "email.service",
      companyId: dto.companyId,
      userId: dto.userId,
      tags: ["email", "sent"],
      payload: { messageId, to: dto.to, subject: dto.subject },
    });

    // ── Save real email to MongoDB ────────────────────────────────────────────
    this.notificationLogRepo
      .create({
        type: "email",
        to: dto.to,
        message: dto.body,
        subject: dto.subject,
        htmlBody: dto.htmlBody,
        channel: "email",
        status: "sent",
        provider: "brevo",
        messageId,
        companyId: dto.companyId,
        userId: dto.userId,
      })
      .catch((err: unknown) =>
        logger.error(
          err instanceof Error ? err : new Error(String(err)),
          { module: "email.service", tags: ["notification_log", "mongo"] },
        ),
      );
    // ─────────────────────────────────────────────────────────────────────────

    return { messageId, status: "sent" };
  }
}
