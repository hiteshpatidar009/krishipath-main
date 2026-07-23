import Redis from "ioredis";
import { RedisConnection } from "./redis.connection";
import { environmentService } from "../../../shared/environment";

export class RedisService {
  private get client(): Redis {
    return RedisConnection.getInstance();
  }

  public async get<T = string>(key: string): Promise<T | null> {
    const value = await this.client.get(key);

    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  public async set(
    key: string,
    value: unknown,
    ttlSeconds?: number,
  ): Promise<void> {
    const serializedValue =
      typeof value === "string" ? value : JSON.stringify(value);

    if (ttlSeconds) {
      await this.client.set(key, serializedValue, "EX", ttlSeconds);
      return;
    }

    await this.client.set(key, serializedValue);
  }

  public async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  public async setIfNotExists(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<boolean> {
    const result = await this.client.set(key, value, "EX", ttlSeconds, "NX");
    return result === "OK";
  }

  public async expire(key: string, ttlSeconds: number): Promise<boolean> {
    return (await this.client.expire(this.key(key), ttlSeconds)) === 1;
  }

  public async keys(pattern: string): Promise<string[]> {
    const [rawKeys, namespacedKeys] = await Promise.all([
      this.client.keys(pattern),
      this.client.keys(this.key(pattern)),
    ]);
    return [...new Set([...rawKeys, ...namespacedKeys])];
  }

  private key(key: string): string {
    return environmentService.cacheKey(key);
  }
}
