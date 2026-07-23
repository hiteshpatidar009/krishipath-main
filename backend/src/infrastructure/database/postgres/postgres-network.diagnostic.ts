import dns from "node:dns/promises";
import net from "node:net";
import { env } from "../../config/env";

export interface PostgresNetworkDiagnosticResult {
  host: string;
  port: number;
  addresses: string[];
  tcpReachable: boolean;
  tcpError?: string;
  hasPrivateAddress: boolean;
  message: string;
}

export class PostgresNetworkDiagnostic {
  public static async inspect(
    host: string,
    port: number,
  ): Promise<PostgresNetworkDiagnosticResult> {
    const addresses = await this.lookup(host);
    const tcp = await this.testTcp(host, port);
    const hasPrivateAddress = addresses.some((address) =>
      this.isPrivateIpv4(address),
    );

    return {
      host,
      port,
      addresses,
      tcpReachable: tcp.ok,
      tcpError: tcp.error,
      hasPrivateAddress,
      message: this.buildMessage(host, port, addresses, tcp, hasPrivateAddress),
    };
  }

  private static async lookup(host: string): Promise<string[]> {
    try {
      const records = await dns.lookup(host, { all: true });
      return records.map((record) => record.address);
    } catch (error) {
      return [error instanceof Error ? error.message : String(error)];
    }
  }

  private static async testTcp(
    host: string,
    port: number,
  ): Promise<{ ok: boolean; error?: string }> {
    return new Promise((resolve) => {
      const socket = net.createConnection({
        host,
        port,
        timeout: env.postgresNetworkDiagnosticTimeoutMs,
      });

      socket.once("connect", () => {
        socket.destroy();
        resolve({ ok: true });
      });

      socket.once("timeout", () => {
        socket.destroy();
        resolve({ ok: false, error: "TCP timeout" });
      });

      socket.once("error", (error) => {
        socket.destroy();
        resolve({ ok: false, error: error.message });
      });
    });
  }

  private static buildMessage(
    host: string,
    port: number,
    addresses: string[],
    tcp: { ok: boolean; error?: string },
    hasPrivateAddress: boolean,
  ): string {
    const networkState =
      tcp.ok ? "tcp reachable" : `tcp blocked (${tcp.error ?? "unknown"})`;
    const renderHint =
      this.isRenderInternalHost(host) ?
        "Render internal hostname detected. Use Render external database hostname or external database URL outside Render private network."
      : undefined;
    const privateHint =
      renderHint ??
      (hasPrivateAddress ?
        "RDS DNS resolves to private VPC IP. Use public RDS access, VPN, bastion, or SSM tunnel."
      : "Check provider hostname, public access, firewall, security group, SSL mode, and allowed IPs.");

    return `host=${host} port=${port} dns=${addresses.join(",")} ${networkState}. ${privateHint}`;
  }

  private static isRenderInternalHost(host: string): boolean {
    return /^dpg-[a-z0-9-]+-a$/i.test(host);
  }

  private static isPrivateIpv4(address: string): boolean {
    const parts = address.split(".").map((part) => Number(part));
    if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
      return false;
    }

    const [first, second] = parts;
    return (
      first === 10 ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168)
    );
  }
}
