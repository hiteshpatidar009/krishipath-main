import { env } from "../../infrastructure/config/env";

class EnvironmentService {
  public exposeDebugMetadata(): boolean {
    return !env.isEnvironmentProduction;
  }

  public cacheKey(key: string): string {
    return `${this.resourceNamespace()}:cache:${key}`;
  }

  public resourceNamespace(): string {
    return env.resourceNamespace;
  }
}

export const environmentService = new EnvironmentService();
