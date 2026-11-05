import Redis from "ioredis";
import { StorageStrategy } from "./storageStrategy";

export class RedisStorage implements StorageStrategy {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    // Vang globale client errors op zodat ze de app niet laten crashen
    this.client.on("error", (err) => {
      // Stilzwijgend opvangen om unhandled error events te voorkomen
    });
  }
  get(key: string): Promise<string | null> {
    throw new Error("Method not implemented.");
  }
  set(key: string, value: string, ttlMs?: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
  hgetall(key: string): Promise<Record<string, string>> {
    throw new Error("Method not implemented.");
  }
  hmset(key: string, data: Record<string, string>, ttlMs?: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async incr(key: string, windowMs: number): Promise<number> {
    try {
      if (this.client.status !== "ready" && this.client.status !== "connecting") {
        await this.client.connect().catch(() => {});
      }
      
      const count = await this.client.incr(key);
      if (count === 1) {
        await this.client.pexpire(key, windowMs);
      }
      return count;
    } catch (error) {
      console.error("Redis incr error:", error);
      throw new Error("Redis storage is tijdelijk onbereikbaar");
    }
  }

  async getTokens(key: string): Promise<any> {
    try {
      if (this.client.status !== "ready" && this.client.status !== "connecting") {
        await this.client.connect().catch(() => {});
      }
      return await this.client.hgetall(key);
    } catch (error) {
      console.error("Redis getTokens error:", error);
      throw new Error("Redis storage is tijdelijk onbereikbaar");
    }
  }

  async setTokens(key: string, tokens: number, lastRefilled: number, ttlSeconds: number): Promise<void> {
    try {
      if (this.client.status !== "ready" && this.client.status !== "connecting") {
        await this.client.connect().catch(() => {});
      }
      await this.client.hset(key, { tokens, lastRefilled });
      await this.client.expire(key, ttlSeconds);
    } catch (error) {
      console.error("Redis setTokens error:", error);
      throw new Error("Redis storage is tijdelijk onbereikbaar");
    }
  }
}