import http, { Server } from "node:http";
import { AddressInfo } from "node:net";
import { App } from "../../../../src/app";
import { databaseManager } from "../../../../src/infrastructure/database";

export class AuthTestServer {
  private server?: Server;
  private baseUrl?: string;

  public async start(): Promise<string> {
    const app = new App();
    await app.initialize();
    this.server = http.createServer(app.getExpressApp());

    await new Promise<void>((resolve, reject) => {
      this.server?.once("error", reject);
      this.server?.listen(0, "127.0.0.1", () => resolve());
    });

    const address = this.server.address();
    if (!address || typeof address === "string") {
      throw new Error("Auth test server bind failed");
    }

    const resolved = address as AddressInfo;
    this.baseUrl = `http://127.0.0.1:${resolved.port}`;
    return this.baseUrl;
  }

  public async stop(): Promise<void> {
    if (!this.server) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      this.server?.close((error?: Error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
    this.server = undefined;
    await databaseManager.disconnectAll().catch(() => undefined);
  }
}
