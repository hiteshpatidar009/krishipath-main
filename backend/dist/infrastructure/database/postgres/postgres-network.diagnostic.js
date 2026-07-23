import dns from "node:dns/promises";
import net from "node:net";
import { env } from "../../config/env";
export class PostgresNetworkDiagnostic {
    static async inspect(host, port) {
        const addresses = await this.lookup(host);
        const tcp = await this.testTcp(host, port);
        const hasPrivateAddress = addresses.some((address) => this.isPrivateIpv4(address));
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
    static async lookup(host) {
        try {
            const records = await dns.lookup(host, { all: true });
            return records.map((record) => record.address);
        }
        catch (error) {
            return [error instanceof Error ? error.message : String(error)];
        }
    }
    static async testTcp(host, port) {
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
    static buildMessage(host, port, addresses, tcp, hasPrivateAddress) {
        const networkState = tcp.ok ? "tcp reachable" : `tcp blocked (${tcp.error ?? "unknown"})`;
        const renderHint = this.isRenderInternalHost(host) ?
            "Render internal hostname detected. Use Render external database hostname or external database URL outside Render private network."
            : undefined;
        const privateHint = renderHint ??
            (hasPrivateAddress ?
                "RDS DNS resolves to private VPC IP. Use public RDS access, VPN, bastion, or SSM tunnel."
                : "Check provider hostname, public access, firewall, security group, SSL mode, and allowed IPs.");
        return `host=${host} port=${port} dns=${addresses.join(",")} ${networkState}. ${privateHint}`;
    }
    static isRenderInternalHost(host) {
        return /^dpg-[a-z0-9-]+-a$/i.test(host);
    }
    static isPrivateIpv4(address) {
        const parts = address.split(".").map((part) => Number(part));
        if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
            return false;
        }
        const [first, second] = parts;
        return (first === 10 ||
            (first === 172 && second >= 16 && second <= 31) ||
            (first === 192 && second === 168));
    }
}
