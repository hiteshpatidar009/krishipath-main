import {
  WASocket,
  ConnectionState,
  proto,
} from "@whiskeysockets/baileys";

import qrcode from "qrcode-terminal";

import { logger } from "../../logger/logger";

import { messageListener } from "./listeners/message.listener";

export function registerEvents(sock: WASocket): void {
  /**
   * Connection Events
   */
  sock.ev.on("connection.update", (update: Partial<ConnectionState>) => {
    const { connection, qr } = update;

    if (qr) {
      logger.info("📱 Scan the QR Code Below");

      qrcode.generate(qr, {
        small: true,
      });
    }

    if (connection === "open") {
      logger.info("✅ WhatsApp Connected Successfully");
    }

    if (connection === "close") {
      logger.warn("❌ WhatsApp Connection Closed");
    }
  });

  /**
   * Incoming Messages
   */
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    await messageListener(messages);
  });

  /**
   * Group Updates
   */
  sock.ev.on("groups.update", (groups) => {
    logger.info({
      groups,
    });
  });

  /**
   * Group Participants Update
   */
  sock.ev.on("group-participants.update", (data) => {
    logger.info({
      data,
    });
  });

  /**
   * Credentials Updated
   */
  sock.ev.on("creds.update", () => {
    logger.debug("Credentials Updated");
  });
}