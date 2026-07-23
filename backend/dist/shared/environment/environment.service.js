import { env } from "../../infrastructure/config/env";
class EnvironmentService {
    exposeDebugMetadata() {
        return !env.isEnvironmentProduction;
    }
    cacheKey(key) {
        return `${this.resourceNamespace()}:cache:${key}`;
    }
    resourceNamespace() {
        return env.resourceNamespace;
    }
}
export const environmentService = new EnvironmentService();
