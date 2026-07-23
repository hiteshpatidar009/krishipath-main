import { proto } from "@whiskeysockets/baileys";
import { logger } from "../../../logger/logger";
import { processIncomingMessage } from "../processors/message.processor";

export async function messageListener(
  messages: proto.IWebMessageInfo[]
): Promise<void> {
  try {
    if (!messages || messages.length === 0) return;

    for (const message of messages) {
      if (!message.message) continue;

      // Ignore status updates
      if (message.key.remoteJid === "status@broadcast") continue;

      // Ignore messages sent by this bot
      if (message.key.fromMe) continue;

      await processIncomingMessage(message);
    }
  } catch (error) {
    logger.error(error, "Message Listener Error");
  }
}