import { proto } from "@whiskeysockets/baileys";

import { logger } from "../../../logger/logger";

import groupService from "../../groups/group.service";

export async function groupListener(
  message: proto.IWebMessageInfo
): Promise<void> {
  try {
    const groupId = message.key.remoteJid;

    if (!groupId) return;

    if (!groupId.endsWith("@g.us")) return;

    await groupService.createOrUpdate({
      groupId,
      groupName: groupId,
      traderName: "",
      participantsCount: 0,
      isActive: true,
    });

    logger.info(`Group Synced : ${groupId}`);
  } catch (error) {
    logger.error(error, "Group Listener Error");
  }
}