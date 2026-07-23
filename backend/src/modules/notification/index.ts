import { Server } from "../../server";

class NotificationServer {
  public static async start(): Promise<void> {
    const server = new Server();
    await server.start();
  }
}

void NotificationServer.start();
