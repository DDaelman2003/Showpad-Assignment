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

  async hmset(key: string, data: Record<string, string>, ttlSeconds?: number): Promise<void> {
    try {
      if (this.client.status !== "ready" && this.client.status !== "connecting") {
        await this.client.connect().catch(() => {});
      }
      await this.client.hset(key, data);
      if (ttlSeconds) {
        await this.client.expire(key, ttlSeconds);
      }
    } catch (error) {
      console.error("Redis hmset error:", error);
      throw new Error("Redis storage is tijdelijk onbereikbaar");
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      if (this.client.status !== "ready" && this.client.status !== "connecting") {
        await this.client.connect().catch(() => {});
      }
      return await this.client.get(key);
    } catch (error) {
      console.error("Redis get error:", error);
      throw new Error("Redis storage is tijdelijk onbereikbaar");
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (this.client.status !== "ready" && this.client.status !== "connecting") {
        await this.client.connect().catch(() => {});
      }
      if (ttlSeconds) {
        await this.client.set(key, value, "EX", ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error("Redis set error:", error);
      throw new Error("Redis storage is tijdelijk onbereikbaar");
    }
  }
  
  async hgetall(key: string): Promise<Record<string, string>> {
    console.log(`[REDIS STORAGE] Hgetall aangeroepen voor: ${key}`);
    try {
      if (this.client.status !== "ready" && this.client.status !== "connecting") {
        await this.client.connect().catch(() => {});
      }
      return await this.client.hgetall(key);
    } catch (error) {
      console.error("Redis hgetall error:", error);
      throw new Error("Redis storage is tijdelijk onbereikbaar");
    }
  }

  async hset(key: string, data: Record<string, any>, ttlSeconds?: number): Promise<void> {
    console.log(`[REDIS STORAGE] Hset aangeroepen voor: ${key}`);
    try {
      if (this.client.status !== "ready" && this.client.status !== "connecting") {
        await this.client.connect().catch(() => {});
      }
      await this.client.hset(key, data);
      if (ttlSeconds) {
        await this.client.expire(key, ttlSeconds);
      }
    } catch (error) {
      console.error("Redis hset error:", error);
      throw new Error("Redis storage is tijdelijk onbereikbaar");
    }
  }

  async incr(key: string, windowMs: number): Promise<number> {
    console.log(`[REDIS STORAGE] Sleutel verhoogd: ${key}`);
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