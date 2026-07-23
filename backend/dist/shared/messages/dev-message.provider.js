import { randomUUID } from "crypto";
import { logger } from "../../infrastructure/logger";
import { DeliveryDto } from "./delivery.dto";
export class DevMessageProvider {
    async send(message) {
        const messageId = randomUUID();
        await logger.warn("Development message provider used", {
            module: "dev-message.provider",
            companyId: message.companyId,
            userId: message.userId,
            tags: ["message", message.channel, "dev-provider"],
            payload: { messageId, recipient: message.recipient, subject: message.subject },
        });
        return new DeliveryDto(messageId, "accepted");
    }
}
