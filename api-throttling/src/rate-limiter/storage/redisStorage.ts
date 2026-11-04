import Redis from "ioredis";
import { StorageStrategy } from "./storageStrategy";

export class RedisStorage implements StorageStrategy {
  private client: Redis;

  constructor(redisUrl: string = process.env.REDIS_URL || "redis://localhost:6379") {
    this.client = new Redis(redisUrl);
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttlMs?: number): Promise<void> {
    if (ttlMs) {
      await this.client.set(key, value, "PX", ttlMs);
    } else {
      await this.client.set(key, value);
    }
  }

  async incr(key: string, ttlMs?: number): Promise<number> {
    const count = await this.client.incr(key);
    if (count === 1 && ttlMs) {
      await this.client.pexpire(key, ttlMs);
    }
    return count;
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return await this.client.hgetall(key);
  }

  async hmset(key: string, data: Record<string, string>, ttlMs?: number): Promise<void> {
    await this.client.hmset(key, data);
    if (ttlMs) {
      await this.client.pexpire(key, ttlMs);
    }
  }
}