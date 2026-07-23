import { WASocket } from "@whiskeysockets/baileys";

export interface WhatsAppService {
  socket: WASocket | null;
}