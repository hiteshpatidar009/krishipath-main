import { proto } from "@whiskeysockets/baileys";

import { logger } from "../../../logger/logger";

import messageService from "../../messages/message.service";
import groupService from "../../groups/group.service";
import { groupListener } from "../listeners/group.listener";

export async function processIncomingMessage(
  message: proto.IWebMessageInfo
): Promise<void> {
  try {
    const groupId = message.key.remoteJid ?? "";
    const messageId = message.key.id ?? "";

    if (!groupId || !messageId) return;

    const sender =
      message.key.participant ??
      message.key.remoteJid ??
      "";

    const senderName = message.pushName ?? "";

    let text = "";

    if (message.message?.conversation) {
      text = message.message.conversation;
    } else if (message.message?.extendedTextMessage?.text) {
      text = message.message.extendedTextMessage.text;
    }

    // Ignore empty messages
    if (!text.trim()) return;

    // Create group if it doesn't exist
    await groupService.createOrUpdate({
      groupId,
      groupName: groupId,
      traderName: "",
      participantsCount: 0,
      isActive: true,
    });

    await groupListener(message);
    await messageService.save({
      messageId,

      groupId,

      sender,

      senderName,

      messageType: "text",

      text,

      rawMessage: message,

      isParsed: false,

      aiStatus: "pending",
    });

    logger.info(`✅ Saved Message : ${messageId}`);

  } catch (error) {
    logger.error(error, "Message Processor Error");
  }
}