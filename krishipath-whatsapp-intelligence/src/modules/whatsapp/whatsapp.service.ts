import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";

import { Boom } from "@hapi/boom";
import path from "path";

import { logger } from "../../logger/logger";
import { registerEvents } from "./events";

class WhatsAppClient {
  private socket: ReturnType<typeof makeWASocket> | null = null;

  async connect() {
    const authPath = path.join(process.cwd(), "auth");

    const { state, saveCreds } = await useMultiFileAuthState(authPath);

    const { version } = await fetchLatestBaileysVersion();

    this.socket = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: true,
      markOnlineOnConnect: false,
      syncFullHistory: false,
    });

    registerEvents(this.socket);
    

    this.socket.ev.on("creds.update", saveCreds);

    this.socket.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
      if (connection === "close") {
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut;

        logger.warn("WhatsApp Disconnected");

        if (shouldReconnect) {
          logger.info("Reconnecting...");
          await this.connect();
        }
      }

      if (connection === "open") {
        logger.info("✅ WhatsApp Connected");
      }
    });

    return this.socket;
  }

  getSocket() {
    return this.socket;
  }
}

export const whatsapp = new WhatsAppClient();