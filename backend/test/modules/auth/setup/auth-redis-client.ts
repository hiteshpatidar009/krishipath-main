import Redis from "ioredis";
import { createHash } from "node:crypto";
import dotenv from "dotenv";

dotenv.config();

interface RedisMfaChallenge {
  readonly id: string;
  readonly codeHash?: string;
  readonly expiresAt: number;
}

export class AuthRedisClient {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL ?? process.env._REDIS_URL ?? "redis://localhost:6379", {
      lazyConnect: false,
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
    });
  }

  public async clearAuthState(): Promise<number> {
    const patterns = [
      "auth:captcha:*",
      "auth:mfa:challenge:*",
      "bull:*",
      "queue:*",
    ];
    let deleted = 0;

    for (const pattern of patterns) {
      deleted += await this.deletePattern(pattern);
    }

    return deleted;
  }

  public async resolveOtp(challengeId: string): Promise<string> {
    const challenge = await this.getChallenge(challengeId);
    if (!challenge?.codeHash) {
      throw new Error(`OTP challenge missing code hash: ${challengeId}`);
    }

    for (let value = 100000; value <= 999999; value += 1) {
      const candidate = String(value);
      if (sha256(candidate) === challenge.codeHash) {
        return candidate;
      }
    }

    throw new Error(`OTP code not resolved: ${challengeId}`);
  }

  public async getChallenge(
    challengeId: string,
  ): Promise<RedisMfaChallenge | undefined> {
    const value = await this.redis.get(`auth:mfa:challenge:${challengeId}`);
    if (!value) {
      return undefined;
    }
    return JSON.parse(value) as RedisMfaChallenge;
  }

  public async disconnect(): Promise<void> {
    await this.redis.quit();
  }

  private async deletePattern(pattern: string): Promise<number> {
    let cursor = "0";
    let count = 0;

    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100,
      );
      cursor = nextCursor;
      if (keys.length) {
        count += await this.redis.del(...keys);
      }
    } while (cursor !== "0");

    return count;
  }
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
