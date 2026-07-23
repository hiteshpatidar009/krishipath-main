import { env } from "../../config/env";
import { PostgresNetworkDiagnostic } from "./postgres-network.diagnostic";
class PostgresConnectivityCheck {
    async run() {
        const results = await Promise.all([
            this.check("DB1", env.db1Options),
        ]);
        for (const result of results) {
            this.print(result);
        }
        const failed = results.filter((result) => !result.reachable);
        if (failed.length) {
            process.exitCode = 1;
        }
    }
    async check(label, options) {
        const diagnostic = await PostgresNetworkDiagnostic.inspect(options.host, options.port);
        return {
            label,
            host: options.host,
            port: options.port,
            addresses: diagnostic.addresses,
            reachable: diagnostic.tcpReachable,
            error: diagnostic.tcpError,
            privateAddress: diagnostic.hasPrivateAddress,
            message: diagnostic.message,
        };
    }
    print(result) {
        this.write(`${result.label}`);
        this.write(`  host: ${result.host}`);
        this.write(`  port: ${result.port}`);
        this.write(`  dns: ${result.addresses.join(", ")}`);
        this.write(`  private: ${result.privateAddress ? "yes" : "no"}`);
        this.write(`  tcp: ${result.reachable ? "reachable" : "blocked"}`);
        if (result.error) {
            this.write(`  error: ${result.error}`);
        }
        if (!result.reachable) {
            this.write(`  fix: ${result.message}`);
        }
    }
    write(message) {
        process.stdout.write(`${message}\n`);
    }
}
void new PostgresConnectivityCheck().run();
