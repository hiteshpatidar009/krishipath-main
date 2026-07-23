import { randomUUID } from "crypto";
import { RedisService } from "../../infrastructure/database/redis/redis.service";
export class DistributedLockService {
    redis = new RedisService();
    async acquire(key, ttlSeconds) {
        const token = randomUUID();
        const lockKey = `lock:${key}`;
        const acquired = await this.redis.setIfNotExists(lockKey, token, ttlSeconds);
        if (!acquired) {
            return null;
        }
        return {
            key: lockKey,
            token,
            release: async () => {
                await this.redis.del(lockKey);
            },
        };
    }
}
