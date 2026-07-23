import twilio from "twilio";

import { env } from "../../../infrastructure/config/env";
import { logger } from "../../../infrastructure/logger";
import { MongoNotificationLogRepository } from "../../../infrastructure/database/mongodb/repositories/notification-log.repository";
import { AppError } from "../../../shared/errors/app.error";
import { SmsDto } from "../dto/sms.dto";

export class SmsService {
  private readonly notificationLogRepo = new MongoNotificationLogRepository();

  public async send(dto: SmsDto): Promise<{ messageId: string; status: string }> {
    const channel = dto.channel ?? "sms";
    const accountSid = env.twilioAccountSid?.trim();
    const authToken = env.twilioAuthToken?.trim();
    const configuredFrom = channel === "whatsapp" ? env.twilioWhatsappFrom : env.twilioSmsFrom;

    if (!accountSid || !/^AC[a-fA-F0-9]{32}$/.test(accountSid) || !authToken || !configuredFrom) {
      throw new AppError(
        "SMS delivery is not configured. Set valid Twilio credentials on the backend.",
        503,
        "SMS_PROVIDER_NOT_CONFIGURED",
      );
    }

    const normalizedPhone = this.normalizeIndianPhone(dto.to);
    const to = channel === "whatsapp" ? this.whatsappAddress(normalizedPhone) : normalizedPhone;
    const from = channel === "whatsapp" ? this.whatsappAddress(configuredFrom) : configuredFrom;

    try {
      const result = await twilio(accountSid, authToken).messages.create({ body: dto.message, from, to });
      const messageId = result.sid;
      const status = String(result.status || "queued");

      await logger.info("SMS submitted to provider", {
        module: "sms.service",
        companyId: dto.companyId,
        userId: dto.userId,
        tags: ["sms", channel, "twilio", "submitted"],
        payload: { messageId, to, channel, status },
      });

      this.notificationLogRepo.create({
        type: channel === "whatsapp" ? "whatsapp" : "sms",
        to,
        channel,
        status: "sent",
        provider: "twilio",
        messageId,
        companyId: dto.companyId,
        userId: dto.userId,
      }).catch((error: unknown) => logger.error(
        error instanceof Error ? error : new Error(String(error)),
        { module: "sms.service", tags: ["notification_log", "mongo"] },
      ));

      return { messageId, status };
    } catch (error: unknown) {
      await logger.error(error instanceof Error ? error : new Error("Twilio SMS delivery failed"), {
        module: "sms.service",
        companyId: dto.companyId,
        userId: dto.userId,
        tags: ["sms", channel, "twilio", "failed"],
        payload: { to, channel },
      });
      throw new AppError("Unable to send the verification code. Please try again.", 502, "SMS_DELIVERY_FAILED");
    }
  }

  private normalizeIndianPhone(value: string): string {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
    if (value.trim().startsWith("+") && digits.length >= 10 && digits.length <= 15) return `+${digits}`;
    throw new AppError("A valid mobile number is required", 400, "INVALID_PHONE_NUMBER");
  }

  private whatsappAddress(value: string): string {
    const address = value.trim();
    return address.startsWith("whatsapp:") ? address : `whatsapp:${address}`;
  }
}
