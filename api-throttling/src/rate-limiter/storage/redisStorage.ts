import Redis from "ioredis";
import { StorageStrategy } from "./storageStrategy";

export class RedisStorage implements StorageStrategy {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      lazyConnect: true, // Maakt pas verbinding bij het eerste Redis-verzoek
      enableOfflineQueue: false, // Voorkomt dat verzoeken blijven hangen als Redis offline is
    });

    // Vang verbindingsfouten netjes op zonder dat de app crasht
    this.client.on("error", (err) => {
      // Stilzwijgend negeren of loggen wanneer Redis niet bereikbaar is
    });
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