import { RedisConnection } from "./redis.connection";
import { environmentService } from "../../../shared/environment";
export class RedisService {
    get client() {
        return RedisConnection.getInstance();
    }
    async get(key) {
        const value = await this.client.get(key);
        if (value === null) {
            return null;
        }
        try {
            return JSON.parse(value);
        }
        catch {
            return value;
        }
    }
    async set(key, value, ttlSeconds) {
        const serializedValue = typeof value === "string" ? value : JSON.stringify(value);
        if (ttlSeconds) {
            await this.client.set(key, serializedValue, "EX", ttlSeconds);
            return;
        }
        await this.client.set(key, serializedValue);
    }
    async del(key) {
        return this.client.del(key);
    }
    async setIfNotExists(key, value, ttlSeconds) {
        const result = await this.client.set(key, value, "EX", ttlSeconds, "NX");
        return result === "OK";
    }
    async expire(key, ttlSeconds) {
        return (await this.client.expire(this.key(key), ttlSeconds)) === 1;
    }
    async keys(pattern) {
        const [rawKeys, namespacedKeys] = await Promise.all([
            this.client.keys(pattern),
            this.client.keys(this.key(pattern)),
        ]);
        return [...new Set([...rawKeys, ...namespacedKeys])];
    }
    key(key) {
        return environmentService.cacheKey(key);
    }
}
