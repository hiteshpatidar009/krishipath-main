import { Server } from "../../server";
class NotificationServer {
    static async start() {
        const server = new Server();
        await server.start();
    }
}
void NotificationServer.start();
