import { env } from "../../config/env";
import { PostgresConnectionOptions } from "./postgres-connection.options";
import { PostgresNetworkDiagnostic } from "./postgres-network.diagnostic";

interface CheckResult {
  label: string;
  host: string;
  port: number;
  addresses: string[];
  reachable: boolean;
  error?: string;
  privateAddress: boolean;
  message: string;
}

class PostgresConnectivityCheck {
  public async run(): Promise<void> {
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

  private async check(
    label: string,
    options: PostgresConnectionOptions,
  ): Promise<CheckResult> {
    const diagnostic = await PostgresNetworkDiagnostic.inspect(
      options.host,
      options.port,
    );

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

  private print(result: CheckResult): void {
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

  private write(message: string): void {
    process.stdout.write(`${message}\n`);
  }
}

void new PostgresConnectivityCheck().run();
