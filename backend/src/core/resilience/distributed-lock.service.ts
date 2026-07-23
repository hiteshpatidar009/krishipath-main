import { randomUUID } from "crypto";

import { RedisService } from "../../infrastructure/database/redis/redis.service";

export interface LockHandle {
  readonly key: string;
  readonly token: string;
  release(): Promise<void>;
}

export class DistributedLockService {
  private readonly redis = new RedisService();

  public async acquire(
    key: string,
    ttlSeconds: number,
  ): Promise<LockHandle | null> {
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
