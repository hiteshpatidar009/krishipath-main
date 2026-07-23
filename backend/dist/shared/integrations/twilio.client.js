import twilio from "twilio";
import { env } from "../../infrastructure/config/env";
import { logger } from "../../infrastructure/logger";
export class TwilioClient {
    client;
    constructor() {
        if (!env.twilioAccountSid || !env.twilioAuthToken) {
            throw new Error("Twilio credentials not configured");
        }
        this.client = twilio(env.twilioAccountSid, env.twilioAuthToken);
    }
    async sendSms(to, message) {
        const from = env.twilioSmsFrom;
        if (!from)
            throw new Error("Twilio SMS From number not configured");
        try {
            const response = await this.client.messages.create({
                body: message,
                from,
                to,
            });
            return response.sid;
        }
        catch (error) {
            logger.error(error instanceof Error ? error : new Error(String(error)), { to, tags: ["twilio", "sms", "failed"] });
            throw error;
        }
    }
    async sendWhatsapp(to, message) {
        const from = env.twilioWhatsappFrom;
        if (!from)
            throw new Error("Twilio WhatsApp From number not configured");
        try {
            const response = await this.client.messages.create({
                body: message,
                from: `whatsapp:${from}`,
                to: `whatsapp:${to}`,
            });
            return response.sid;
        }
        catch (error) {
            logger.error(error instanceof Error ? error : new Error(String(error)), { to, tags: ["twilio", "whatsapp", "failed"] });
            throw error;
        }
    }
}
